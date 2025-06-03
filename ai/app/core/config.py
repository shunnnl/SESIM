from pathlib import Path
import logging
import os

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# 0. 경로
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_DIR  = BASE_DIR / "data"
MODEL_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────
# 1. 버전 · 임계값
# ─────────────────────────────────────────────
MODEL_VERSION = "1.0.0"
BIN_THRESH    = 0.52

TYPE_THRESHOLDS: dict[str, float] = {
    "sql_injection"     : 0.35,
    "command_injection" : 0.25,
    "directory_traversal": 0.30,
    "xss"               : 0.30, 
    "ssrf_rfi"          : 0.30, 
    "webshell"          : 0.15,  
}

# ─────────────────────────────────────────────
# 2. 기능 플래그
# ─────────────────────────────────────────────
ENABLE_DEVOPS_WHITELIST   = os.getenv("ENABLE_DEVOPS_WHITELIST",   "true").lower() == "true"
ENABLE_WEBSHELL_BOOST     = os.getenv("ENABLE_WEBSHELL_BOOST",     "true").lower() == "true"
ENABLE_STATIC_FILTER      = os.getenv("ENABLE_STATIC_FILTER",      "true").lower() == "true"
ENABLE_AUTO_THRESHOLD     = os.getenv("ENABLE_AUTO_THRESHOLD",     "true").lower() == "true"
ENABLE_POST_UPLOAD_FILTER = os.getenv("ENABLE_POST_UPLOAD_FILTER", "true").lower() == "true"

# ─────────────────────────────────────────────
# 3. 감점·보정 파라미터
# ─────────────────────────────────────────────
DEVOPS_REDUCTION_FACTOR = float(os.getenv("DEVOPS_REDUCTION_FACTOR", "0.6")) 
SEARCH_REDUCTION_FACTOR = float(os.getenv("SEARCH_REDUCTION_FACTOR", "0.8")) 
POST_UPLOAD_REDUCTION   = float(os.getenv("POST_UPLOAD_REDUCTION",   "0.1")) 
JSP_WEBSHELL_BOOST      = float(os.getenv("JSP_WEBSHELL_BOOST",      "0.25"))
PHP_WEBSHELL_BOOST      = float(os.getenv("PHP_WEBSHELL_BOOST",      "0.20"))

# ─────────────────────────────────────────────
# 4. 학습 · 피처 상수
# ─────────────────────────────────────────────
EXPECTED_META_FEATURE_DIMS    = 5
EXPECTED_PATTERN_FEATURE_DIMS = None  # utils.get_pattern_feature_dims() 호출 시 계산

RNG = 42
VEC_MAX_FEAT = 150_000
TRAINING_OPTIMIZATION_LEVEL = os.getenv("TRAINING_OPTIMIZATION", "balanced")  # fast|balanced|quality

# ─────────────────────────────────────────────
# 5. XGBoost 파라미터
# ─────────────────────────────────────────────
def get_optimized_bin_params(level: str = "balanced") -> dict:
    base = dict(
        random_state=RNG, tree_method="hist", eval_metric="logloss",
        n_jobs=-1, verbosity=0,
    )
    if level == "fast":
        return {**base,
            "n_estimators":200,"max_depth":5,"learning_rate":0.20,
            "subsample":0.8,"colsample_bytree":0.8,
            "min_child_weight":3,"gamma":0.1,
            "reg_alpha":0.01,"reg_lambda":0.05,
        }
    if level == "quality":
        return {**base,
            "n_estimators":400,"max_depth":7,"learning_rate":0.15,
            "subsample":0.9,"colsample_bytree":0.9,
            "min_child_weight":5,"gamma":0.15,
            "reg_alpha":0.01,"reg_lambda":0.10,
        }
    return {**base,
        "n_estimators":300,"max_depth":6,"learning_rate":0.18,
        "subsample":0.9,"colsample_bytree":0.9,
        "min_child_weight":5,"gamma":0.15,
        "reg_alpha":0.01,"reg_lambda":0.10,
    }

def get_optimized_type_params(level: str = "balanced") -> dict:
    base = dict(
        random_state=RNG, tree_method="hist", eval_metric="mlogloss",
        n_jobs=-1, verbosity=0,
    )
    if level == "fast":
        return {**base,
            "n_estimators":200,"max_depth":5,"learning_rate":0.20,
            "subsample":0.8,"colsample_bytree":0.8,
            "min_child_weight":3,"gamma":0.1,
            "reg_alpha":0.01,"reg_lambda":0.05,
        }
    return {**base,
        "n_estimators":250,"max_depth":6,"learning_rate":0.20,
        "subsample":0.85,"colsample_bytree":0.85,
        "min_child_weight":4,"gamma":0.10,
        "reg_alpha":0.02,"reg_lambda":0.15,
    }

BIN_PARAMS  = get_optimized_bin_params(TRAINING_OPTIMIZATION_LEVEL)
TYPE_PARAMS = get_optimized_type_params(TRAINING_OPTIMIZATION_LEVEL)

# ─────────────────────────────────────────────
# 6. 증분 학습
# ─────────────────────────────────────────────
TRAINING_HISTORY_DIR = DATA_DIR / "training_history"
FULL_RETRAIN_CYCLE   = 5
RETENTION_RATIO      = 0.70

# ─────────────────────────────────────────────
# 7. 공격 유형 우선순위 · 매핑
# ─────────────────────────────────────────────
ATTACK_TYPE_PRIORITY = {
    "webshell":100,"command_injection":95,"sql_injection":90,
    "directory_traversal":80,"xss":70,"ssrf_rfi":60,
}
SUPPORTED_ATTACK_TYPES = set(ATTACK_TYPE_PRIORITY)

LEGACY_TYPE_MAPPING = {
    "code_injection":"command_injection","rce":"command_injection",
    "remote_code_execution":"command_injection","cmd_injection":"command_injection",
    "web_shell":"webshell","backdoor":"webshell",
    "file_upload_attack":"webshell","file_upload":"webshell",
    "path_traversal":"directory_traversal","lfi":"directory_traversal",
    "local_file_inclusion":"directory_traversal",
    "rfi":"ssrf_rfi","remote_file_inclusion":"ssrf_rfi",
    "server_side_request_forgery":"ssrf_rfi","ssrf":"ssrf_rfi",
    "cross_site_scripting":"xss","sqli":"sql_injection",
}

def normalize_attack_type(tp: str | None) -> str | None:
    if not tp:
        return tp
    low = tp.lower().strip()
    return LEGACY_TYPE_MAPPING.get(low, low)

# ─────────────────────────────────────────────
# 8. 헬퍼
# ─────────────────────────────────────────────
def get_pattern_feature_dims() -> int:
    """
    utils.PATTERN_COLS 길이를 가져오되,
    import 순환을 피하기 위해 지연 import.
    """
    from app.utils import PATTERN_COLS  # noqa: WPS433
    return len(PATTERN_COLS)

def validate_config() -> None:
    """
    서비스 시작 시 호출될 수 있는 기본 검증 함수
    (값 범위·지원 타입 체크).
    """
    # TYPE_THRESHOLDS 검증
    for atk, thr in TYPE_THRESHOLDS.items():
        if not (0.0 <= thr <= 1.0):
            raise ValueError(f"잘못된 임계값: {atk}={thr}")
        if atk not in SUPPORTED_ATTACK_TYPES:
            raise ValueError(f"지원하지 않는 공격 유형: {atk}")

    if not (0.1 <= DEVOPS_REDUCTION_FACTOR <= 1.0):
        raise ValueError("DEVOPS_REDUCTION_FACTOR 범위 오류")
    logger.info("✅ config 검증 완료 (v%s)", MODEL_VERSION)
