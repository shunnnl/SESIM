from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MODEL_VERSION = "1.0.0"

MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / f"model_v{MODEL_VERSION}" / f"xgboost_nginx_model_v{MODEL_VERSION}.pkl"
VECTORIZER_PATH = MODEL_DIR / f"model_v{MODEL_VERSION}" / f"tfidf_vectorizer_v{MODEL_VERSION}.pkl"

# 증분 학습
TRAINING_HISTORY_DIR = DATA_DIR / "training_history"
FULL_RETRAIN_CYCLE = 5  # 이 주기마다 완전 재학습 수행
RETENTION_RATIO = 0.7   # 기존 데이터에서 유지할 비율 (재앙적 망각 방지)