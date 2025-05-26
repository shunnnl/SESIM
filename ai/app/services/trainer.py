from __future__ import annotations

import json, logging, re
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, List

import joblib, numpy as np, pandas as pd
from imblearn.under_sampling import RandomUnderSampler
from imblearn.over_sampling import RandomOverSampler
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBClassifier

from app.core.config  import MODEL_DIR, RNG, VEC_MAX_FEAT, BIN_PARAMS
from app.core.encoder import UnifiedEncoder
from app.utils        import preprocess_url, extract_url_features, PATTERN_COLS

logger = logging.getLogger(__name__)


class UnifiedModelBundle:
    """통합 모델 번들 - 모든 모델과 인코더를 하나로 관리"""
    
    def __init__(self):
        self.vectorizer = None
        self.encoder = UnifiedEncoder()
        self.binary_classifier = None
        self.type_classifier = None
        self.version = None
        self.meta = {}
    
    def save(self, model_dir: Path):
        """모델 번들 저장 (3개 파일만)"""
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. 텍스트 벡터라이저
        joblib.dump(self.vectorizer, model_dir / "vectorizer.pkl", compress=3)
        
        # 2. 통합 인코더 (모든 범주형 인코더 포함)
        joblib.dump(self.encoder, model_dir / "unified_encoder.pkl", compress=3)
        
        # 3. 모델들 (이진 + 유형 분류)
        models = {
            'binary_classifier': self.binary_classifier,
            'type_classifier': self.type_classifier
        }
        joblib.dump(models, model_dir / "models.pkl", compress=3)
        
        # 메타데이터
        (model_dir / "meta.json").write_text(json.dumps(self.meta, indent=2))
        
        logger.info(f"✅ 통합 모델 번들 저장: {model_dir}")
    
    @staticmethod
    def load(model_dir: Path) -> 'UnifiedModelBundle':
        """모델 번들 로드"""
        bundle = UnifiedModelBundle()
        
        bundle.vectorizer = joblib.load(model_dir / "vectorizer.pkl")
        bundle.encoder = joblib.load(model_dir / "unified_encoder.pkl")
        
        models = joblib.load(model_dir / "models.pkl")
        bundle.binary_classifier = models['binary_classifier']
        bundle.type_classifier = models.get('type_classifier')  # 선택적
        
        meta_path = model_dir / "meta.json"
        if meta_path.exists():
            bundle.meta = json.loads(meta_path.read_text())
        
        return bundle


def prepare_training_data(csv_path: Path) -> Tuple[sparse.csr_matrix, np.ndarray, UnifiedModelBundle]:
    """학습 데이터 준비 및 통합 번들 생성"""
    df = pd.read_csv(csv_path)
    
    # null 값 처리
    df["is_attack"] = df["is_attack"].fillna(False)
    logger.info(f"is_attack null 값 {df['is_attack'].isnull().sum()}개 행을 False로 처리했습니다.")

    # 1) 텍스트 전처리
    df["url_prep"] = df["url"].apply(preprocess_url)
    y = df["is_attack"].astype(int).to_numpy()

    # 2) 통합 번들 생성
    bundle = UnifiedModelBundle()
    
    # 텍스트 벡터라이저 학습
    bundle.vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(3, 5),
        max_features=VEC_MAX_FEAT,
        min_df=3,
    )
    X_txt = bundle.vectorizer.fit_transform(df["url_prep"])

    # 통합 인코더 학습
    bundle.encoder.fit_method_agent(
        df["method"].fillna("GET").tolist(),
        df["user_agent"].fillna("").tolist()
    )
    
    # 공격 유형 데이터가 있으면 학습
    attack_df = df[df["is_attack"] == True]
    if not attack_df.empty and "attack_type" in attack_df.columns:
        valid_types = attack_df["attack_type"].dropna().str.strip()
        valid_types = valid_types[valid_types != ""].tolist()
        if valid_types:
            bundle.encoder.fit_attack_types(valid_types)

    # 3) 피처 변환
    m_idx, a_idx = bundle.encoder.transform_method_agent(
        df["method"].fillna("GET").tolist(),
        df["user_agent"].fillna("").tolist()
    )
    
    status = df["status_code"].astype("int16").to_numpy()
    clen = (
        df.get("content_length", 0).fillna(0).astype("int32").to_numpy()
        if "content_length" in df.columns else
        np.zeros(len(df), dtype="int32")
    )

    X_meta = sparse.csr_matrix(
        np.stack([m_idx, a_idx, status, clen], 1).astype("float32")
    )

    # 4) 패턴 피처
    X_ptrn = sparse.csr_matrix(
        extract_url_features(df).values.astype("float32")
    )

    # 5) 모든 피처 결합
    X = sparse.hstack([X_txt, X_meta, X_ptrn], format="csr")
    
    return X, y, bundle


def auto_label_attacks(df: pd.DataFrame) -> pd.DataFrame:
    """자동 라벨링: 패턴 기반으로 6개 공격 유형 추론 (균형 개선)"""
    
    # SQL Injection 패턴 (우선순위 1)
    sqli_patterns = [
        r"'.*--", r"'.*#", r"'.*=", r"1\s*=\s*1", r"union\s+select",
        r"drop\s+table", r"delete\s+from", r"information_schema",
        r"sleep\s*\(", r"benchmark\s*\(", r"concat\s*\(",
        r"'\s*or\s*'", r"'\s*or\s*1", r"order\s+by\s+\d+"
    ]
    
    # Command Injection 패턴 (우선순위 2)
    cmd_patterns = [
        r'[;&|`$]', r'\|\|', r'&&', r'\$\(',
        r'\b(rm|cat|ls|pwd|whoami|id|uname|ps|wget|curl|nc|bash|sh|cmd|powershell)\s',
        r'(cmd|command|exec|shell|system)=',
        r'\$\{.*\}', r'%.*%', r'<\?php', r'eval\s*\(', r'base64_decode'
    ]
    
    # Directory Traversal 패턴 (우선순위 3)
    dt_patterns = [
        r'(\.\./)+', r'\.\.[\\/]', r'%2e%2e[\\/]', r'%252e%252e[\\/]',
        r'(etc\/passwd|etc\/shadow|etc\/hosts|web\.config|wp-config\.php|\.env|config\.php)',
        r'(boot\.ini|win\.ini|system32)', r'%00'
    ]
    
    # XSS 패턴 (우선순위 4)
    xss_patterns = [
        r'<script', r'<svg', r'<img.*on\w+', r'<iframe', r'javascript:', r'vbscript:',
        r'on\w+\s*=', r'alert\s*\(', r'document\.(write|writeln)', r'eval\s*\(',
        r'data:text/html'
    ]
    
    # SSRF/RFI 패턴 (우선순위 5)
    ssrf_patterns = [
        r'(file|https?|ftp|gopher|dict|ldap)://.*(?:localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.169\.254)',
        r'metadata', r'169\.254\.169\.254',
        r'(url|proxy|redirect|path|file|src|target|uri)=.*(?:file:|https?://)',
        r'(include|require|page|template|view|content)=.*(?:https?://|ftp://)',
        r'metadata\.(google|amazonaws|azure)'
    ]
    
    # TLS 프로브 패턴 (우선순위 6 - 마지막)
    tls_patterns = [
        r'\\x16\\x03', r'%5cx16%5cx03', r'tls.*handshake', r'ssl.*handshake',
        r'client.*hello', r'server.*hello'
    ]

    def match_patterns(text: str, patterns: list) -> bool:
        if pd.isna(text):
            return False
        text_lower = str(text).lower()
        return any(re.search(pattern, text_lower, re.I) for pattern in patterns)

    # 자동 라벨링 적용 (우선순위 재조정 - SQL, Command 우선)
    for idx, row in df.iterrows():
        if pd.notna(row.get("attack_type")) and str(row.get("attack_type")).strip():
            continue  # 이미 라벨이 있으면 건너뛰기
        
        url = str(row.get("url", "")) if pd.notna(row.get("url")) else ""
        ua = str(row.get("user_agent", "")) if pd.notna(row.get("user_agent")) else ""
        combined_text = f"{url} {ua}"
        
        # 우선순위 재조정 (SQL, Command 우선)
        if match_patterns(combined_text, sqli_patterns):
            df.at[idx, "attack_type"] = "sql_injection"
        elif match_patterns(combined_text, cmd_patterns):
            df.at[idx, "attack_type"] = "command_injection"
        elif match_patterns(combined_text, dt_patterns):
            df.at[idx, "attack_type"] = "directory_traversal"
        elif match_patterns(combined_text, xss_patterns):
            df.at[idx, "attack_type"] = "xss"
        elif match_patterns(combined_text, ssrf_patterns):
            df.at[idx, "attack_type"] = "ssrf_rfi"
        elif match_patterns(combined_text, tls_patterns):
            df.at[idx, "attack_type"] = "tls_probe"
            
    return df


class UnifiedTrainer:
    """통합 트레이너 - 이진 분류 + 유형 분류를 함께 학습"""
    
    def __init__(self, version: str):
        self.version = str(version)
        self.out_dir = MODEL_DIR / f"model_v{self.version}"
        if self.out_dir.exists():
            raise FileExistsError(f"{self.out_dir} already exists")

    def train(self, csv_path: str | Path) -> Dict[str, str]:
        csv_path = Path(csv_path)
        X, y, bundle = prepare_training_data(csv_path)
        
        # 1) 이진 분류 학습
        logger.info("이진 분류 모델 학습 시작...")
        X_bin, y_bin = RandomUnderSampler(random_state=RNG).fit_resample(X, y)
        
        bundle.binary_classifier = XGBClassifier(
            **BIN_PARAMS,
            random_state=RNG,
            tree_method="hist",
            eval_metric="logloss",
        ).fit(X_bin, y_bin)
        
        logger.info(f"이진 분류 완료 - 학습 데이터: {X_bin.shape[0]}개")

        # 2) 유형 분류 학습 (공격 데이터가 있는 경우만)
        df = pd.read_csv(csv_path)
        attack_df = df[df["is_attack"] == True]
        
        if not attack_df.empty:
            logger.info("공격 유형 분류 모델 학습 시작...")
            
            # 자동 라벨링 적용
            df = auto_label_attacks(df)
            attack_df = df[df["is_attack"] == True]
            
            # attack_type 컬럼이 있고 유효한 값이 있는지 확인
            if "attack_type" in attack_df.columns:
                attack_df = attack_df.dropna(subset=["attack_type"])
                attack_df = attack_df[attack_df["attack_type"].str.strip() != ""]
                
                # 라벨 정규화 (6개 유형으로 통합)
                label_mapping = {
                    # Command Injection 통합
                    "cmd_injection": "command_injection",
                    "rce": "command_injection", 
                    "remote_code_execution": "command_injection",
                    "code_injection": "command_injection",  # code_injection을 command_injection으로 통합
                    
                    # Directory Traversal 통합
                    "path_traversal": "directory_traversal",
                    "lfi": "directory_traversal",
                    "local_file_inclusion": "directory_traversal",
                    
                    # SSRF/RFI 통합
                    "rfi": "ssrf_rfi",
                    "remote_file_inclusion": "ssrf_rfi",
                    "server_side_request_forgery": "ssrf_rfi",
                    "ssrf": "ssrf_rfi",
                    
                    # XSS 통합
                    "cross_site_scripting": "xss",
                    
                    # SQL Injection 통합
                    "sqli": "sql_injection",
                    "sql_inj": "sql_injection",
                    
                    # TLS Probe 통합
                    "tls": "tls_probe",
                    "ssl_probe": "tls_probe",
                }
                
                attack_df["attack_type"] = attack_df["attack_type"].replace(label_mapping)
                
                if not attack_df.empty:
                    # 공격 데이터에 대한 피처 추출
                    attack_indices = attack_df.index
                    X_attack = X[attack_indices]
                    
                    # 공격 유형 인코딩
                    attack_types = attack_df["attack_type"].str.strip().tolist()
                    y_type = bundle.encoder.transform_attack_types(attack_types)
                    
                    # 유효한 라벨만 사용 (-1 제외)
                    if y_type is not None:
                        valid_mask = y_type != -1
                        if valid_mask.sum() > 0:
                            X_type = X_attack[valid_mask]
                            y_type_valid = y_type[valid_mask]
                            
                            # 클래스 분포 확인
                            unique_classes, class_counts = np.unique(y_type_valid, return_counts=True)
                            class_names = bundle.encoder.inverse_transform_attack_types(unique_classes)
                            class_distribution = dict(zip(class_names, class_counts))
                            logger.info(f"클래스 분포: {class_distribution}")
                            
                            # 클래스 불균형 보정
                            try:
                                X_type_bal, y_type_bal = RandomOverSampler(
                                    random_state=RNG
                                ).fit_resample(X_type, y_type_valid)
                                
                                bundle.type_classifier = XGBClassifier(
                                    objective="multi:softprob",
                                    num_class=len(bundle.encoder.get_attack_type_classes()),
                                    n_estimators=250,
                                    max_depth=6,
                                    learning_rate=0.2,
                                    tree_method="hist",
                                    random_state=RNG,
                                    n_jobs=-1,
                                ).fit(X_type_bal, y_type_bal)
                                
                                logger.info(f"유형 분류 완료 - 클래스: {bundle.encoder.get_attack_type_classes()}")
                            except Exception as e:
                                logger.warning(f"유형 분류 학습 실패: {e}")

        # 3) 메타데이터 생성
        bundle.version = self.version
        bundle.meta = {
            "version": self.version,
            "trained_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "n_samples": int(X.shape[0]),
            "positive_rate": float(y.mean()),
            "pattern_cols": PATTERN_COLS,
            "attack_type_classes": bundle.encoder.get_attack_type_classes(),
            "has_type_classifier": bundle.type_classifier is not None
        }

        # 4) 모델 저장
        bundle.save(self.out_dir)
        
        return bundle.meta


# 외부 엔트리포인트 (기존 호환성 유지)
def robust_incremental_training(csv_path: str, model_version: str, **_) -> Dict[str, str]:
    """FastAPI 엔드포인트에서 호출 (통합 트레이너 사용)"""
    return UnifiedTrainer(model_version).train(csv_path)


# 모델 이력 조회 (기존과 동일)
def _read_history(version: str | None = None) -> List[Dict]:
    """models/model_v*/meta.json 파일들을 읽어 반환"""
    from packaging.version import parse as vparse

    metas: List[Dict] = []
    for p in MODEL_DIR.glob("model_v*"):
        meta_path = p / "meta.json"
        if meta_path.exists():
            try:
                metas.append(json.loads(meta_path.read_text()))
            except Exception as e:
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