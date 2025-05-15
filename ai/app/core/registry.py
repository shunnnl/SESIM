from __future__ import annotations

import logging, joblib
from pathlib import Path
from typing import Dict, Tuple, List

from packaging.version import Version, parse as vparse
from app.core.config import MODEL_DIR

logger = logging.getLogger(__name__)


_BUNDLE_CACHE: Dict[str, Tuple] = {}


def _scan_model_folders() -> List[Path]:
    return sorted(
        MODEL_DIR.glob("model_v*"),
        key=lambda p: vparse(p.name.split("model_v")[-1]),
    )


def get_available_model_versions() -> List[str]:
    """['1.2.0', '1.1.0', ...]  (최신이 맨 앞)"""
    folders = _scan_model_folders()
    return [p.name.split("model_v")[-1] for p in reversed(folders)]


def get_next_model_version() -> str:
    """
    가장 최신 패치버전에 +0.0.1 증가
    예) 1.3.2 → 1.3.3
    처음이면 1.0.0
    """
    vers = get_available_model_versions()
    if not vers:
        return "1.0.0"
    latest = Version(vers[0])
    next_ver = Version(f"{latest.major}.{latest.minor}.{latest.micro + 1}")
    return str(next_ver)


def _latest_version() -> str:
    vers = get_available_model_versions()
    if not vers:
        raise FileNotFoundError("models/model_v* 폴더가 없습니다.")
    return vers[0]


def load_bundle(version: str | None = None):
    """
    반환: (bin_clf, vectorizer, method_enc, agent_enc)
    version=None → 최신 버전 자동 선택
    """
    if version is None:
        version = _latest_version()

    if version in _BUNDLE_CACHE:
        return _BUNDLE_CACHE[version]

    vdir = MODEL_DIR / f"model_v{version}"
    bin_clf = joblib.load(vdir / "xgb_bin_clf.pkl")
    vec     = joblib.load(vdir / "vectorizer.pkl")
    m_enc   = joblib.load(vdir / "method_encoder.pkl")
    a_enc   = joblib.load(vdir / "agent_encoder.pkl")

    _BUNDLE_CACHE[version] = (bin_clf, vec, m_enc, a_enc)
    logger.info(f"[REGISTRY] 모델 로드 → {vdir}")
    return _BUNDLE_CACHE[version]


def clear_bundle_cache():
    """학습 직후 호출 → 다음 예측부터 새 모델 사용"""
    _BUNDLE_CACHE.clear()
    logger.info("[REGISTRY] 모델 캐시 초기화 완료")
