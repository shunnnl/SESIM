from pathlib import Path

# 기본 디렉터리 
BASE_DIR  = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR  = BASE_DIR / "data"
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# Runtime 상수 
MODEL_VERSION   = "1.0.0"
BIN_THRESH      = 0.50
TYPE_THRESHOLDS = {                  
    "command_injection"  : 0.40,
    "code_injection"     : 0.45,
    "sql_injection"      : 0.35,
    "xss"                : 0.45,
    "directory_traversal": 0.50,
    "ssrf_rfi"           : 0.50,
    "tls_probe"          : 0.50,
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

#  증분 학습 관련
TRAINING_HISTORY_DIR = DATA_DIR / "training_history"
FULL_RETRAIN_CYCLE   = 5    # n회 증분 후 전체 재학습
RETENTION_RATIO      = 0.70 # 전체 재학습 시 데이터 유지 비율