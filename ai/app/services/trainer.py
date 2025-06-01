from __future__ import annotations

import re 
import json
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from scipy import sparse
from xgboost import XGBClassifier
from imblearn.over_sampling import RandomOverSampler
from imblearn.under_sampling import RandomUnderSampler
from sklearn.feature_extraction.text import TfidfVectorizer

from app.core.config import (
    BIN_PARAMS,
    TYPE_PARAMS,
    MODEL_DIR,
    RNG,
    VEC_MAX_FEAT,
    EXPECTED_META_FEATURE_DIMS,
    SUPPORTED_ATTACK_TYPES,
    normalize_attack_type,
    get_pattern_feature_dims,
    TRAINING_OPTIMIZATION_LEVEL,
)
from app.core.encoder import UnifiedEncoder
from app.utils import (
    PATTERN_COLS,
    extract_url_features,
    preprocess_url,
    build_meta_features,
    validate_meta_features,
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# 1. 모델 번들
# ─────────────────────────────────────────────
class UnifiedModelBundle:

    def __init__(self) -> None:
        self.vectorizer = None
        self.encoder = UnifiedEncoder()
        self.binary_classifier = None
        self.type_classifier = None
        self.version = None
        self.meta: Dict = {}

    # 저장·로드
    def save(self, model_dir: Path) -> None:
        model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.vectorizer, model_dir / "vectorizer.pkl", compress=3)
        joblib.dump(self.encoder,    model_dir / "unified_encoder.pkl", compress=3)
        joblib.dump(
            {
                "binary_classifier": self.binary_classifier,
                "type_classifier":   self.type_classifier,
            },
            model_dir / "models.pkl",
            compress=3,
        )
        (model_dir / "meta.json").write_text(json.dumps(self.meta, indent=2))
        logger.info("통합 모델 번들 저장: %s", model_dir)

    @staticmethod
    def load(model_dir: Path) -> "UnifiedModelBundle":
        bundle = UnifiedModelBundle()
        bundle.vectorizer = joblib.load(model_dir / "vectorizer.pkl")
        bundle.encoder    = joblib.load(model_dir / "unified_encoder.pkl")
        models = joblib.load(model_dir / "models.pkl")
        bundle.binary_classifier = models["binary_classifier"]
        bundle.type_classifier   = models.get("type_classifier")
        meta_path = model_dir / "meta.json"
        if meta_path.exists():
            bundle.meta = json.loads(meta_path.read_text())
        return bundle


# ─────────────────────────────────────────────
# 2. 데이터 준비
# ─────────────────────────────────────────────
def prepare_training_data(csv_path: Path) -> Tuple[sparse.csr_matrix, np.ndarray, UnifiedModelBundle]:

    df = pd.read_csv(csv_path)

    if "attack_type" in df.columns:
        df = df[
            df["is_attack"].eq(False)
            | (
                df["attack_type"].notna()
                & df["attack_type"].astype(str).str.strip().ne("")
            )
        ]

    df["is_attack"] = df["is_attack"].fillna(False)
    df["url_prep"]  = df["url"].apply(preprocess_url)

    bundle = UnifiedModelBundle()

    # 2-1. URL TF-IDF
    bundle.vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        max_features=VEC_MAX_FEAT,
        min_df=3,
        dtype=np.float32,
    )
    X_txt = bundle.vectorizer.fit_transform(df["url_prep"])

    # 2-2. 메서드·UA 인코딩
    bundle.encoder.fit_method_agent(
        df["method"].fillna("GET").tolist(),
        df["user_agent"].fillna("").tolist(),
    )

    # 2-3. 메타 피처
    X_meta = build_meta_features(df, bundle.encoder)
    validate_meta_features(X_meta, EXPECTED_META_FEATURE_DIMS)

    # 2-4. 패턴 피처
    X_ptrn = sparse.csr_matrix(
        extract_url_features(df)[PATTERN_COLS].values.astype(np.float32)
    )
    exp_dims = get_pattern_feature_dims()
    if X_ptrn.shape[1] != exp_dims:
        raise ValueError(f"패턴 피처 차원 불일치: 예상 {exp_dims}, 실제 {X_ptrn.shape[1]}")

    # 2-5. 결합
    X = sparse.hstack([X_txt, X_meta, X_ptrn], format="csr")
    y = df["is_attack"].astype(np.int8).to_numpy()

    return X, y, bundle


# ─────────────────────────────────────────────
# 3. 웹셸 우선 자동 라벨링
# ─────────────────────────────────────────────
def auto_label_attacks(df: pd.DataFrame) -> pd.DataFrame:

    webshell_patterns = [
        r"(\\?|&)(cmd|command|exec|shell|system|run|action|do|op|operation)=",
        r"\.(jsp|php)\?.*(?:cmd|command|exec|shell)=",
        r"/shells?/.*\.(jsp|php)",
        r"(c99|r57|wso|b374k|webshell|backdoor)\.(php|jsp)",
    ]
    injection_patterns = [
        r"\b(cmd|exec|system)\b",
        r"(bash|sh)\s+-c",
        r"\b(cat|ls|nc|curl|wget)\b\s",
    ]
    dt_patterns = [
        r"\.\./\.\./",
        r"\b/etc/passwd\b",
        r"\bboot.ini\b",
    ]
    xss_patterns = [
        r"(?i)<script\b[^>]*>",
        r"(?i)javascript:",
        r"alert\s*\(",
    ]
    sqli_patterns = [
        r"(?i)\bunion\b.*\bselect\b",
        r"(?i)(--|#|/\*)",
        r"(\bor\b.+(?:=|like).*?\btrue\b|\b1[ =]1\b)",
    ]
    ssrf_patterns = [
        r"\b(?:file|dict|gopher|http|https|tcp|ftp):\/\/",
        r"@169\.254\.169\.254",
        r"metadata\.google\.internal",
    ]

    def hit(text: str, patterns: List[str]) -> bool:
        return bool(text) and any(re.search(p, text, re.I) for p in patterns)

    for idx, row in df.iterrows():
        if row.get("attack_type"):
            continue
        combined = f"{row.get('url','')} {row.get('user_agent','')}".lower()
        if hit(combined, webshell_patterns):
            df.at[idx, "attack_type"] = "webshell"
        elif hit(combined, injection_patterns):
            df.at[idx, "attack_type"] = "command_injection"
        elif hit(combined, dt_patterns):
            df.at[idx, "attack_type"] = "directory_traversal"
        elif hit(combined, xss_patterns):
            df.at[idx, "attack_type"] = "xss"
        elif hit(combined, sqli_patterns):
            df.at[idx, "attack_type"] = "sql_injection"
        elif hit(combined, ssrf_patterns):
            df.at[idx, "attack_type"] = "ssrf_rfi"
    return df


# ─────────────────────────────────────────────
# 4. 트레이너
# ─────────────────────────────────────────────
class UnifiedTrainer:

    def __init__(self, version: str) -> None:
        self.version = str(version)
        self.out_dir = MODEL_DIR / f"model_v{self.version}"
        if self.out_dir.exists():
            raise FileExistsError(f"{self.out_dir} 이미 존재합니다")

    def train(self, csv: str | Path) -> Dict[str, str]:
        csv = Path(csv)
        t0 = time.time()
        logger.info("🚀 학습 시작 (opt-level: %s)", TRAINING_OPTIMIZATION_LEVEL)

        # 4-1. 데이터 준비
        X, y, bundle = prepare_training_data(csv)

        # 4-2. 이진 분류
        if len(y) > 100_000:
            sampler = RandomUnderSampler(random_state=RNG, sampling_strategy=0.8)
            X_bin, y_bin = sampler.fit_resample(X, y)
        else:
            X_bin, y_bin = X, y
        bundle.binary_classifier = XGBClassifier(**BIN_PARAMS).fit(X_bin, y_bin)

        # 4-3. 다중 분류
        df_full = pd.read_csv(csv)
        df_full = auto_label_attacks(df_full)
        attack_df = df_full[df_full["is_attack"]]
        if not attack_df.empty and "attack_type" in attack_df.columns:
            attack_df = attack_df.dropna(subset=["attack_type"])
            attack_df["attack_type"] = attack_df["attack_type"].apply(normalize_attack_type)
            attack_df = attack_df[attack_df["attack_type"].isin(SUPPORTED_ATTACK_TYPES)]

            bundle.encoder.fit_attack_types(attack_df["attack_type"].tolist())
            y_type = bundle.encoder.transform_attack_types(attack_df["attack_type"].tolist())

            X_txt = bundle.vectorizer.transform(attack_df["url"].apply(preprocess_url))
            X_meta = build_meta_features(attack_df, bundle.encoder)
            validate_meta_features(X_meta, EXPECTED_META_FEATURE_DIMS)
            X_ptrn = sparse.csr_matrix(
                extract_url_features(attack_df)[PATTERN_COLS].values.astype(np.float32)
            )
            X_type = sparse.hstack([X_txt, X_meta, X_ptrn], format="csr")

            ros = RandomOverSampler(random_state=RNG)
            X_bal, y_bal = ros.fit_resample(X_type, y_type)

            bundle.type_classifier = XGBClassifier(**TYPE_PARAMS).fit(X_bal, y_bal)
        else:
            logger.warning("유형 라벨이 부족해 공격 유형 분류를 건너뜁니다")

        # 4-4. 저장
        bundle.version = self.version
        bundle.meta = {
            "version": self.version,
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "total_samples": len(y),
            "optimization_level": TRAINING_OPTIMIZATION_LEVEL,
        }
        bundle.save(self.out_dir)

        logger.info("학습 완료 (%.1fs)", time.time() - t0)
        return {"status": "ok", "version": self.version}


# ─────────────────────────────────────────────
# 5. FastAPI 엔트리포인트
# ─────────────────────────────────────────────
def robust_incremental_training(csv_path: str, model_version: str, **_) -> Dict[str, str]:
    return UnifiedTrainer(model_version).train(csv_path)
