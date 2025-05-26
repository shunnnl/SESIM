from pathlib import Path

# 기본 디렉터리 
BASE_DIR  = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR  = BASE_DIR / "data"
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# Runtime 상수 
MODEL_VERSION   = "1.0.0"
BIN_THRESH      = 0.50  # 이진 분류 임계값

# 공격 유형별 임계값 - 탐지 균형 개선
TYPE_THRESHOLDS = {                  
    "tls_probe"          : 0.45,    # 0.30 -> 0.45 (과탐지 방지)
    "ssrf_rfi"           : 0.35,    # 유지
    "xss"                : 0.35,    # 0.40 -> 0.35 (탐지율 향상)
    "command_injection"  : 0.25,    # 0.35 -> 0.25 (탐지율 대폭 향상)
    "sql_injection"      : 0.25,    # 0.30 -> 0.25 (탐지율 대폭 향상)
    "directory_traversal": 0.30,    # 0.40 -> 0.30 (탐지율 향상)
}

# Trainer 공통 하이퍼파라미터
RNG          = 42
VEC_MAX_FEAT = 200_000              
BIN_PARAMS   = {
    "n_estimators"     : 350,
    "max_depth"        : 6,
    "learning_rate"    : 0.18,
    "subsample"        : 0.9,
    "colsample_bytree" : 0.9,
}

# 증분 학습 관련
TRAINING_HISTORY_DIR = DATA_DIR / "training_history"
FULL_RETRAIN_CYCLE   = 5    # n회 증분 후 전체 재학습
RETENTION_RATIO      = 0.70 # 전체 재학습 시 데이터 유지 비율

# 화이트리스트 관련 설정
WHITELIST_CONFIDENCE_REDUCTION = 0.3  # 화이트리스트 항목의 공격 점수 감소율
RULE_OVERRIDE_MIN_SCORE = 0.7         # 규칙 기반 오버라이드 최소 점수