from __future__ import annotations

import json, logging
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, List

import joblib, numpy as np, pandas as pd
from imblearn.under_sampling import RandomUnderSampler
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBClassifier

from app.core.config  import MODEL_DIR, RNG, VEC_MAX_FEAT, BIN_PARAMS
from app.core.encoder import SafeEncoder
from app.utils        import preprocess_url, extract_url_features, PATTERN_COLS

logger = logging.getLogger(__name__)


# 내부 전처리
def _prepare_xy(csv_path: Path) -> Tuple[sparse.csr_matrix, np.ndarray, TfidfVectorizer, Tuple[SafeEncoder, SafeEncoder]]:
    df = pd.read_csv(csv_path)

    # 1) 텍스트 전처리
    df["url_prep"] = df["url"].apply(preprocess_url)
    y = df["is_attack"].astype(int).to_numpy()

    vec = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        max_features=VEC_MAX_FEAT,
        min_df=3,
    )
    X_txt = vec.fit_transform(df["url_prep"])

    # 2) 메타 인코딩
    enc_m = SafeEncoder(df["method"].unique().tolist())
    enc_a = SafeEncoder(df["user_agent"].unique().tolist())

    m_idx = df["method"].apply(enc_m.transform).astype("int16").to_numpy()
    a_idx = df["user_agent"].apply(enc_a.transform).astype("int16").to_numpy()
    status = df["status_code"].astype("int16").to_numpy()
    clen = (
        df.get("content_length", 0).fillna(0).astype("int32").to_numpy()
        if "content_length" in df.columns else
        np.zeros(len(df), dtype="int32")
    )

    X_meta = sparse.csr_matrix(
        np.stack([m_idx, a_idx, status, clen], 1).astype("float32")
    )

    # 3) 패턴
    X_ptrn = sparse.csr_matrix(
        extract_url_features(df).values.astype("float32")
    )

    # 4) 합치기 + 샘플링
    X = sparse.hstack([X_txt, X_meta, X_ptrn], format="csr")
    X_bal, y_bal = RandomUnderSampler(random_state=RNG).fit_resample(X, y)
    return X_bal, y_bal, vec, (enc_m, enc_a)


# Trainer 클래스
class BinaryTrainer:
    def __init__(self, version: str):
        self.version = str(version)
        self.out_dir = MODEL_DIR / f"model_v{self.version}"
        if self.out_dir.exists():
            raise FileExistsError(f"{self.out_dir} already exists")
        self.out_dir.mkdir(parents=True)

    def train(self, csv_path: str | Path) -> Dict[str, str]:
        csv_path = Path(csv_path)
        X, y, vec, (enc_m, enc_a) = _prepare_xy(csv_path)

        model = XGBClassifier(
            **BIN_PARAMS,
            random_state=RNG,
            tree_method="hist",
            eval_metric="logloss",
        ).fit(X, y)

        # 아티팩트 저장
        joblib.dump(model,   self.out_dir / "xgb_bin_clf.pkl",    compress=3)
        joblib.dump(vec,     self.out_dir / "vectorizer.pkl",     compress=3)
        joblib.dump(enc_m,   self.out_dir / "method_encoder.pkl", compress=3)
        joblib.dump(enc_a,   self.out_dir / "agent_encoder.pkl",  compress=3)

        meta = {
            "version"      : self.version,
            "trained_at"   : datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "n_samples"    : int(X.shape[0]),
            "positive_rate": float(y.mean()),
            "pattern_cols" : PATTERN_COLS,
        }
        (self.out_dir / "meta.json").write_text(json.dumps(meta, indent=2))
        logger.info("✅ model_v%s saved", self.version)
        return meta


# 외부 엔트리포인트
def robust_incremental_training(csv_path: str, model_version: str, **_) -> Dict[str, str]:
    """FastAPI 엔드포인트에서 호출"""
    return BinaryTrainer(model_version).train(csv_path)


# 모델 이력 조회
def _read_history(version: str | None = None) -> List[Dict]:
    """models/model_v*/meta.json 파일들을 읽어 반환"""
    from packaging.version import parse as vparse

    metas: List[Dict] = []
    for p in MODEL_DIR.glob("model_v*"):
        meta_path = p / "meta.json"
        if meta_path.exists():
            try:
                metas.append(json.loads(meta_path.read_text()))
            except Exception as e:  # pragma: no cover
                logger.warning("메타 로드 실패: %s", e)

    if not metas:
        return []

    metas.sort(key=lambda m: vparse(m.get("version", "0.0.0")))

    if version is None:
        return metas
    if str(version).lower() == "latest":
        return [metas[-1]]
    for m in metas:
        if str(m.get("version")) == str(version):
            return [m]
    raise FileNotFoundError(f"model_v{version} not found")
