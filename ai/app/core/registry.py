from __future__ import annotations

import logging, joblib
from pathlib import Path
from typing import Dict, Tuple, List

from packaging.version import Version, parse as vparse
from app.core.config import MODEL_DIR

logger = logging.getLogger(__name__)


_BUNDLE_CACHE: Dict[str, Tuple] = {}


def _scan_model_folders() -> List[Path]:
    folders = list(MODEL_DIR.glob("model_v*"))
    if not folders:
        logger.warning("MODEL_DIR에 model_v* 폴더가 존재하지 않습니다.")
        raise FileNotFoundError("models/model_v* 폴더가 없습니다.")
    
    return sorted(
        folders,
        key=lambda p: vparse(p.name.split("model_v")[-1]),
    )


def get_available_model_versions() -> List[str]:

    try:
        folders = _scan_model_folders()
        return [p.name.split("model_v")[-1] for p in reversed(folders)]
    except FileNotFoundError:
        logger.error("사용 가능한 모델 버전을 찾을 수 없습니다.")
        return []


def get_next_model_version() -> str:

    vers = get_available_model_versions()
    if not vers:
        return "1.0.0"
    latest = Version(vers[0])
    next_ver = Version(f"{latest.major}.{latest.minor}.{latest.micro + 1}")
    return str(next_ver)


def _latest_version() -> str:
    vers = get_available_model_versions()
    if not vers:
        logger.error("models/model_v* 폴더가 없습니다.")
        return "1.0.0"  # 기본값 반환 - 폴더가 없어도 초기화 시 1.0.0으로 시작할 수 있도록
    return vers[0]


def load_bundle(version: str | None = None):

    try:
        if version is None:
            version = _latest_version()

        # 캐시에 없는 경우, 폴더 존재 여부 먼저 확인
        if version not in _BUNDLE_CACHE:
            vdir = MODEL_DIR / f"model_v{version}"
            if not vdir.exists():
                logger.error(f"모델 디렉토리가 존재하지 않습니다: {vdir}")
                # 최신 버전으로 다시 시도
                version = _latest_version()
                vdir = MODEL_DIR / f"model_v{version}"
                if not vdir.exists():
                    raise FileNotFoundError(f"모델 디렉토리가 존재하지 않습니다: {vdir}")

        if version in _BUNDLE_CACHE:
            logger.debug(f"모델 캐시에서 로드 → v{version}")
            return _BUNDLE_CACHE[version]

        vdir = MODEL_DIR / f"model_v{version}"
        bin_clf = joblib.load(vdir / "xgb_bin_clf.pkl")
        vec     = joblib.load(vdir / "vectorizer.pkl")
        m_enc   = joblib.load(vdir / "method_encoder.pkl")
        a_enc   = joblib.load(vdir / "agent_encoder.pkl")

        _BUNDLE_CACHE[version] = (bin_clf, vec, m_enc, a_enc)
        logger.info(f"[REGISTRY] 모델 로드 → {vdir}")
        return _BUNDLE_CACHE[version]
    
    except Exception as e:
        logger.error(f"모델 로드 중 오류 발생: {e}")
        # 캐시를 초기화하고 다시 시도
        clear_bundle_cache()
        raise


def clear_bundle_cache():

    _BUNDLE_CACHE.clear()
    logger.info("[REGISTRY] 모델 캐시 초기화 완료")