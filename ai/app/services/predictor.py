from __future__ import annotations

import logging, re
from scipy import sparse
from typing import List, Set
from functools import lru_cache
import numpy as np, pandas as pd
from urllib.parse import urlparse


from app.core.config import (
    BIN_THRESH, TYPE_THRESHOLDS, EXPECTED_META_FEATURE_DIMS,
    ENABLE_DEVOPS_WHITELIST, ENABLE_WEBSHELL_BOOST, ENABLE_STATIC_FILTER,
    ENABLE_POST_UPLOAD_FILTER, DEVOPS_REDUCTION_FACTOR, SEARCH_REDUCTION_FACTOR,
    POST_UPLOAD_REDUCTION, JSP_WEBSHELL_BOOST, PHP_WEBSHELL_BOOST,
)
from app.core.registry import has_trained_model, load_bundle
from app.dto.request import RawLog
from app.dto.response import PredictResult
from app.utils import (
    extract_url_features, preprocess_url,
    build_meta_features, validate_meta_features,
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# 1. 패턴·화이트리스트
# ─────────────────────────────────────────────
JSP_WEBSHELL_PATTERNS = [
    re.compile(r"\.jsp\?.*(?:cmd|command|exec|shell|system)=", re.I),
    re.compile(r"/upload.*\.jsp\?", re.I),
    re.compile(r"\.jsp.*(?:action|do|op)=.*(?:cmd|exec)", re.I),
    re.compile(r"/shells?/.*\.jsp", re.I),
]
PHP_WEBSHELL_PATTERNS = [
    re.compile(r"(c99|r57|wso|b374k|webshell|shell)\.php", re.I),
    re.compile(r"\.php\?.*(?:cmd|command|exec)=", re.I),
    re.compile(r"eval\s*\(\s*\$_(GET|POST|REQUEST)\[", re.I),
]
DEVOPS_PATHS: Set[str] = {
    "/api/build", "/api/deploy", "/api/ci", "/api/pipeline",
    "/build", "/deploy", "/jenkins", "/gitlab-ci",
    "/monitoring", "/health", "/healthz", "/metrics", "/actuator",
}
SEARCH_PATHS: Set[str] = {"/search", "/query", "/filter", "/find", "/autocomplete"}
STATIC_EXTENSIONS: Set[str] = {
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif",
    ".svg", ".ico", ".woff", ".woff2", ".ttf", ".pdf",
    ".map", ".eot",
}

# ─────────────────────────────────────────────
# 2. 캐시 헬퍼
# ─────────────────────────────────────────────
@lru_cache(maxsize=1000)
def is_jsp_webshell_boost(url: str) -> bool:
    return ENABLE_WEBSHELL_BOOST and any(p.search(url) for p in JSP_WEBSHELL_PATTERNS)

@lru_cache(maxsize=1000)
def is_php_webshell_boost(url: str) -> bool:
    return ENABLE_WEBSHELL_BOOST and any(p.search(url) for p in PHP_WEBSHELL_PATTERNS)

@lru_cache(maxsize=500)
def get_path_whitelist_factor(url: str) -> float:
    if not ENABLE_DEVOPS_WHITELIST:
        return 1.0
    path = urlparse(url).path.lower()
    if any(p in path for p in DEVOPS_PATHS):
        return DEVOPS_REDUCTION_FACTOR
    if any(p in path for p in SEARCH_PATHS):
        return SEARCH_REDUCTION_FACTOR
    return 1.0

@lru_cache(maxsize=200)
def is_legitimate_request(url: str, method: str, content_type: str | None) -> bool:
    """HOTFIX ② – 정적 파일 필터 개선"""
    # GET·HEAD 정적 파일
    if method in {"GET", "HEAD"} and ENABLE_STATIC_FILTER:
        path = urlparse(url).path.lower()
        return any(path.endswith(ext) for ext in STATIC_EXTENSIONS)

    # POST 업로드 화이트리스트
    if (
        ENABLE_POST_UPLOAD_FILTER
        and method == "POST"
        and content_type
        and any(ct in content_type.lower() for ct in {"multipart/", "application/octet-stream", "application/zip"})
        and any(k in url.lower() for k in {"/upload", "/file", "/attach", "/media"})
    ):
        return True
    return False

# ─────────────────────────────────────────────
# 3. 전처리
# ─────────────────────────────────────────────
def _prep_df(logs: List[RawLog]) -> pd.DataFrame:
    df = pd.DataFrame([l.dict() for l in logs])
    df["url"] = df["url"].fillna("").apply(preprocess_url)
    df["method"] = df["method"].fillna("GET").str.upper()
    df["user_agent"] = df["user_agent"].fillna("")
    df["status_code"] = pd.to_numeric(df["status_code"], errors="coerce").fillna(200).astype(int)
    
    # content_type이 DTO에 없으므로 기본값으로 추가
    df["content_type"] = ""
    df["content_length"] = None
    return df

# ─────────────────────────────────────────────
# 4. 예측 파이프라인
# ─────────────────────────────────────────────
def predict_logs(logs: List[RawLog]) -> List[PredictResult]:
    if not has_trained_model():
        raise RuntimeError("모델이 없습니다. 먼저 /api/train 으로 학습하세요.")
    bundle = load_bundle()
    if bundle is None:
        raise RuntimeError("모델 로드 실패")

    df = _prep_df(logs)

    X_txt = bundle.vectorizer.transform(df["url"])
    X_meta = build_meta_features(df, bundle.encoder)
    validate_meta_features(X_meta, EXPECTED_META_FEATURE_DIMS)
    X_ptrn = sparse.csr_matrix(extract_url_features(df).values.astype(np.float32))
    X = sparse.hstack([X_txt, X_meta, X_ptrn], format="csr")

    bin_probs = bundle.binary_classifier.predict_proba(X)[:, 1]
    is_attack_pred = bin_probs >= BIN_THRESH
    type_pred: List[str | None] = [None] * len(df)

    if np.any(is_attack_pred) and bundle.type_classifier is not None:
        idxs = np.where(is_attack_pred)[0]
        type_ps = bundle.type_classifier.predict_proba(X[idxs])
        for k, orig in enumerate(idxs):
            probs = type_ps[k]
            typ_i = int(np.argmax(probs))
            typ = bundle.encoder.inverse_transform_attack_types([typ_i])[0]
            if probs[typ_i] >= TYPE_THRESHOLDS.get(typ, 0.5):
                type_pred[orig] = typ

    results: List[PredictResult] = []
    for i, row in df.iterrows():
        url, method = row.url, row.method
        ctype = getattr(row, 'content_type', '') or ""

        ml_score = float(bin_probs[i])
        ml_is_attack = bool(is_attack_pred[i])
        ml_attack_type = type_pred[i]

        # ① 화이트리스트(정적 파일·업로드)
        if is_legitimate_request(url, method, ctype):
            final_score, final_is_attack, final_attack_type = 0.1, False, None
        else:
            final_score, final_is_attack, final_attack_type = ml_score, ml_is_attack, ml_attack_type

            # ② 웹셸 부스트
            if ENABLE_WEBSHELL_BOOST:
                boost = 0.0
                if is_jsp_webshell_boost(url):
                    boost = JSP_WEBSHELL_BOOST
                elif is_php_webshell_boost(url):
                    boost = PHP_WEBSHELL_BOOST
                if boost > 0:
                    final_score = min(0.95, final_score + boost)
                    final_is_attack = True
                    final_attack_type = "webshell"

            # ③ DevOps/검색 화이트리스트
            factor = get_path_whitelist_factor(url)
            if factor < 1.0:
                final_score *= factor
                if final_attack_type and final_score < TYPE_THRESHOLDS.get(final_attack_type, 0.5):
                    final_is_attack, final_attack_type = False, None

        results.append(
            PredictResult(
                is_attack=final_is_attack,
                attack_score=round(final_score, 4),
                attack_type=final_attack_type,
            )
        )
    return results