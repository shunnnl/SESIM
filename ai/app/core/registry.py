from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, List, Optional

from packaging.version import Version, parse as vparse
from app.core.config import MODEL_DIR

logger = logging.getLogger(__name__)

_BUNDLE_CACHE: Dict[str, 'UnifiedModelBundle'] = {}

def _scan_model_folders() -> List[Path]:
    """모델 폴더 스캔 - 빈 리스트 반환 가능"""
    if not MODEL_DIR.exists():
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"MODEL_DIR 생성: {MODEL_DIR}")
    
    folders = list(MODEL_DIR.glob("model_v*"))
    if not folders:
        logger.info("MODEL_DIR에 model_v* 폴더가 존재하지 않습니다. 첫 번째 학습을 진행하세요.")
        return []
    
    return sorted(
        folders,
        key=lambda p: vparse(p.name.split("model_v")[-1]),
    )

def get_available_model_versions() -> List[str]:
    """사용 가능한 모델 버전 반환 - 빈 리스트 가능"""
    try:
        folders = _scan_model_folders()
        return [p.name.split("model_v")[-1] for p in reversed(folders)]
    except Exception as e:
        logger.error(f"모델 버전 스캔 중 오류: {e}")
        return []

def get_next_model_version() -> str:
    """다음 모델 버전 반환"""
    vers = get_available_model_versions()
    if not vers:
        return "1.0.0"
    latest = Version(vers[0])
    next_ver = Version(f"{latest.major}.{latest.minor}.{latest.micro + 1}")
    return str(next_ver)

def _latest_version() -> Optional[str]:
    """최신 버전 반환 - None 가능"""
    vers = get_available_model_versions()
    if not vers:
        logger.warning("사용 가능한 모델이 없습니다.")
        return None
    return vers[0]

def has_trained_model() -> bool:
    """학습된 모델이 있는지 확인"""
    return bool(get_available_model_versions())

def load_bundle(version: str | None = None) -> Optional['UnifiedModelBundle']:
    """통합 모델 번들 로드"""
    try:
        if version is None:
            version = _latest_version()
            if version is None:
                logger.warning("로드할 모델이 없습니다. 먼저 학습을 진행하세요.")
                return None

        # 캐시에서 확인
        if version in _BUNDLE_CACHE:
            logger.debug(f"모델 캐시에서 로드 → v{version}")
            return _BUNDLE_CACHE[version]

        # 모델 디렉토리 확인
        vdir = MODEL_DIR / f"model_v{version}"
        if not vdir.exists():
            logger.error(f"모델 디렉토리가 존재하지 않습니다: {vdir}")
            
            # 최신 버전으로 다시 시도
            latest_version = _latest_version()
            if latest_version and latest_version != version:
                logger.info(f"최신 버전으로 재시도: {latest_version}")
                return load_bundle(latest_version)
            else:
                logger.warning("사용 가능한 모델이 없습니다.")
                return None

        # 필수 파일 존재 확인 (3개만)
        required_files = [
            "vectorizer.pkl",
            "unified_encoder.pkl", 
            "models.pkl"
        ]
        
        missing_files = [f for f in required_files if not (vdir / f).exists()]
        if missing_files:
            logger.error(f"필수 모델 파일이 누락되었습니다: {missing_files}")
            return None

        # 통합 모델 번들 로드
        from app.services.trainer import UnifiedModelBundle
        bundle = UnifiedModelBundle.load(vdir)

        _BUNDLE_CACHE[version] = bundle
        logger.info(f"[REGISTRY] 통합 모델 번들 로드 완료 → {vdir}")
        return bundle
    
    except Exception as e:
        logger.error(f"모델 로드 중 오류 발생: {e}")
        # 캐시를 초기화하고 None 반환
        clear_bundle_cache()
        return None

def clear_bundle_cache():
    """모델 캐시 초기화"""
    _BUNDLE_CACHE.clear()
    logger.info("[REGISTRY] 모델 캐시 초기화 완료")

def create_initial_model_structure():
    """초기 모델 디렉토리 구조 생성"""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"모델 디렉토리 생성: {MODEL_DIR}")