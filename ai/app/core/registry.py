import joblib
import logging
from pathlib import Path
from functools import lru_cache
from app.core.config import MODEL_DIR, DEFAULT_MODEL_ID

logger = logging.getLogger(__name__)

class ModelNotFound(Exception):
    def __init__(self, model_id: int, message: str = "모델을 찾을 수 없습니다.") -> None:
        self.model_id = model_id
        self.message = f"모델 ID {model_id}을(를) 찾을 수 없습니다. {message}"
        super().__init__(self.message)


def get_available_model_versions(model_id: int = DEFAULT_MODEL_ID):
    model_dir = MODEL_DIR / str(model_id)
    if not model_dir.exists():
        return []
    
    versions = []
    for item in model_dir.iterdir():
        if item.is_dir() and item.name.startswith("model_v"):
            version = item.name.replace("model_v", "")
            versions.append(version)
    
    versions.sort(key=lambda v: [int(x) for x in v.split(".")])
    return versions


@lru_cache(maxsize=8)
def load_bundle(model_id: int = DEFAULT_MODEL_ID):

    versions = get_available_model_versions(model_id)
    if not versions:
        raise ModelNotFound(model_id, "사용 가능한 모델 버전이 없습니다.")
    
    model_version = versions[-1]
    
    model_dir = MODEL_DIR / str(model_id) / f"model_v{model_version}"
    logger.info(f"모델 번들 로드: ID={model_id}, 버전={model_version}")

    try:
        model_path = model_dir / f"xgboost_nginx_model_v{model_version}.pkl"
        vectorizer_path = model_dir / f"tfidf_vectorizer_v{model_version}.pkl"
        method_encoder_path = model_dir / f"method_encoder_v{model_version}.pkl"
        agent_encoder_path = model_dir / f"agent_encoder_v{model_version}.pkl"
        
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        method_encoder = joblib.load(method_encoder_path)
        agent_encoder = joblib.load(agent_encoder_path)
            
    except FileNotFoundError as e:
        raise ModelNotFound(model_id, f"모델 번들이 불완전합니다: {e.filename} 파일을 찾을 수 없습니다.")
    except Exception as e:
        raise ModelNotFound(model_id, f"모델 로드 중 오류: {str(e)}")

    return model, vectorizer, method_encoder, agent_encoder