from __future__ import annotations

import json
import logging
import re
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from scipy import sparse

from app.core.registry import load_bundle, _latest_version, clear_bundle_cache
from app.core.config import MODEL_DIR, BIN_THRESH, TYPE_THRESHOLDS
from app.utils import preprocess_url, extract_url_features
from app.dto.request import RawLog
from app.dto.response import PredictResult

logger = logging.getLogger(__name__)

# 정규표현식 사전 컴파일

# 디렉터리 탐색 및 민감한 파일 접근 시도 탐지
DT_PATTERNS = [re.compile(p, re.I) for p in [
    r"(\.\./)+", r"\.\.[\\/]", r"[\\/]\.\.\\/", r"%2e%2e[\\/]", r"%252e%252e[\\/]"]]
SENSITIVE_FILES = ["etc/passwd", "etc/shadow", "etc/hosts", "proc/self", "wp-config.php",
                   "config.php", ".env", "web.config", ".htaccess"]

# Code / PHP injection
CODE_INJECTION_PATTERNS = [re.compile(p, re.I) for p in [
    r"<\?php", r"(?:system|exec|passthru|shell_exec)\(", r"\beval\s*\(",
    r"file_get_contents\(", r"include\s*\(.*\)", r"require\s*\(.*\)"]]

# XSS
XSS_PATTERNS = [re.compile(p, re.I) for p in [
    r"<script", r"<svg", r"<img", r"<iframe", r"javascript:", r"onerror=", r"onload=", r"onclick=",
    r"onfocus=", r"alert\s*\(", r"eval\s*\("]]

# SQL injection
SQLI_HIGH = [re.compile(p, re.I) for p in [
    r"'.*--", r"'.*#", r"'.*=", r"1=1", r"'=\'", r"union\s+select", r"drop\s+table",
    r"delete\s+from", r"update\s+.*\s+set", r"exec\s+xp_", r"into\s+outfile", r"load_file",
    r"sleep\s*\(", r"benchmark\s*\(", r"concat\s*\(", r"group_concat\s*\(", r"having\s+\d+=\d+"
]]
SQLI_LOW = [re.compile(p, re.I) for p in [r"select\s+.*\s+from", r"'", r'\"', r"--", r";" ]]
SQL_KEYWORDS = ["select", "from", "where", "group by", "order by", "having", "join"]

# SSRF/RFI - 내부 접근 시도 탐지 패턴
SSRF_PATTERNS = [re.compile(p, re.I) for p in [
    r"(url|proxy|redirect|path|file|src|target|uri)=.*(?:file:|https?://(?:169\.254\.169\.254|localhost|127\.0\.0\.1|0\.0\.0\.0|%3A%2F%2F))",
    r"metadata",
    r"169\.254\.169\.254",
    r"localhost",
    r"127\.0\.0\.1"
]]

# 정적 리소스 화이트리스트
STATIC_PATTERNS = [re.compile(p) for p in [
    r"^/static/.*\.(js|css|png|jpg|gif|svg|woff|ttf)$",
    r"^/assets/.*\.(js|css|png|jpg|gif|svg|woff|ttf)$",
    r"^/dist/.*\.(js|css|png|jpg|gif|svg|woff|ttf)$",
    r"^/build/.*\.(js|css|png|jpg|gif|svg|woff|ttf)$",
    r"^/.*\.(js|css|png|jpg|gif|ico|svg|woff|ttf)$"]]

# 헬퍼 함수: 정규표현식 리스트에 대해 문자열 검색
def _any_match(text: str, patterns: list[re.Pattern]) -> bool:
    return any(p.search(text) for p in patterns)

# 전처리 유틸
def _prep_df(logs: List[RawLog]) -> pd.DataFrame:
    df = pd.DataFrame([l.dict() for l in logs])
    df["url"] = df["url"].apply(preprocess_url)
    df["method"] = df["method"].fillna("GET")
    df["user_agent"] = df["user_agent"].fillna("")
    df["status_code"] = pd.to_numeric(df["status_code"], errors="coerce").fillna(200).astype(int)
    if "content_length" in df.columns:
        df["content_length"] = pd.to_numeric(df["content_length"], errors="coerce").fillna(0).astype(int)
    else:
        df["content_length"] = 0
    return df


def _load_meta(ver: str) -> dict:
    meta_path = Path(MODEL_DIR) / f"model_v{ver}" / "meta.json"
    if not meta_path.exists():
        logger.error(f"메타 파일을 찾을 수 없습니다: {meta_path}")
        # 캐시 초기화 시도
        clear_bundle_cache()
        # 최신 버전 다시 확인
        ver = _latest_version()
        meta_path = Path(MODEL_DIR) / f"model_v{ver}" / "meta.json"
        if not meta_path.exists():
            raise FileNotFoundError(f"메타 파일을 찾을 수 없습니다: {meta_path}")
    
    return json.loads(meta_path.read_text())


# 규칙 기반 후처리: 모델 예측값을 룰 기반으로 보정
def _rule_adjust(label: str | None, score: float, row: pd.Series) -> tuple[str | None, float, bool]:
    """Return (label, score, override_attack)"""
    url: str = row.url.lower()
    method: str = row.method.upper()
    user_agent: str = row.user_agent.lower()

    path, _, query = url.partition("?")

    # 헬스 체크 요청 무시 처리 (kube-probe, prometheus 등)
    health_paths = ["/healthz", "/health", "/ping", "/status", "/ready", "/live"]
    health_uas = ["kube-probe", "prometheus", "grafana", "datadog", "newrelic"]
    if any(h in path for h in health_paths) and (any(h in user_agent for h in health_uas) or method == "HEAD"):
        dangerous_cmd = any(k in query for k in ["rm", "cat", "|", ";", "bash", "wget", "curl", "nc"])
        if "cmd=" in query and not dangerous_cmd:
            return None, 0.3, False

    # 1) 고신뢰 SQL 인젝션 - 항상 우선 적용
    if _any_match(url, SQLI_HIGH):
        return "sql_injection", max(score, 0.9), True


    # 2) 검색 컨텍스트 내 SQL 키워드 허용 (오탐 방지)
    is_search_ctx = any(tag in path for tag in ["/search", "/find"]) or any(k in query for k in ["q=", "query=", "keyword=", "term="])

    if is_search_ctx:
        q_param = re.search(r"q=([^&]+)", query)
        if q_param:
            q_value = q_param.group(1)
            if any(kw in q_value for kw in SQL_KEYWORDS) and not _any_match(q_value, SQLI_HIGH):
                return None, 0.1, True
        
        # 기존 검사도 유지
        if any(kw in url for kw in SQL_KEYWORDS) and not _any_match(url, SQLI_HIGH):

            risky_chars = ["'", "\"", "--", "#", ";", " union ", " or "]
            if not any(rc in url for rc in risky_chars):
                return None, 0.3, True

    # 3) 디렉터리 탐색 + 명령어 삽입 조합 우선 적용
    has_cmd_sep = any(sep in url for sep in [";", "|", "&&", "`", "$", "$("]) or "cmd=" in url
    dt_hit = _any_match(url, DT_PATTERNS) or any(f in url for f in SENSITIVE_FILES)
    if has_cmd_sep and dt_hit:
        return "command_injection", max(score, 0.85), True
    if dt_hit:
        return "directory_traversal", max(score, 0.85), True

    # 4) 코드 삽입 시도
    if _any_match(url, CODE_INJECTION_PATTERNS):
        return "code_injection", max(score, 0.85), True

    # 5) 명령어 삽입 (헬스체크 제외)
    if not _any_match(user_agent, [re.compile(r"kube-probe")]) and has_cmd_sep:
        return "command_injection", max(score, 0.8), True

    # 6) XSS patterns
    if _any_match(url, XSS_PATTERNS):
        return "xss", max(score, 0.85), True

    # 7) 저신뢰 SQLi 또는 sqlmap 도구 탐지
    if _any_match(url, SQLI_LOW) or ('sqlmap' in user_agent and query):
        return "sql_injection", max(score, 0.85), True

    if 'sqlmap' in user_agent and not _any_match(url, SQLI_HIGH + SQLI_LOW):
        
        if re.match(r"^/(products|items)/\d+$", path):
            return None, min(score, 0.4), False
        return "sql_injection", 0.65, True

    # 8) TLS 시도 (비정상 요청)
    if method in {"BADTLS", "UNKNOWN"} and "\\x16\\x03" in url:
        return "tls_probe", max(score, 0.99), True

    # 9) SSRF / RFI
    if _any_match(url, SSRF_PATTERNS):
        return "ssrf_rfi", max(score, 0.8), True

    # 10) 정적 자원 요청은 무시 (공격 쿼리 포함 안된 경우에만)
    if any(pat.match(path) for pat in STATIC_PATTERNS):
        if not _any_match(query, XSS_PATTERNS + SQLI_HIGH + SQLI_LOW):
            return None, 0.3, False
        
    # 11) 로그인 요청은 브라우저 UA 기반 화이트리스트 적용
    if method == "POST" and re.match(r"^/(login|signin|auth|api/login)", path):
        if re.search(r"mozilla|chrome|safari|firefox|edge", user_agent, re.I):
            risky_sql = ["'", "\"", "--", "#", ";", " union ", " select "]
            if not any(r in url for r in risky_sql):
                return None, 0.3, False

    return label, score, False


# Main
def predict_logs(logs: List[RawLog], version: str | None = None) -> List[PredictResult]:
    if not logs:
        return []

    try:
        version = version or _latest_version()
        bin_clf, vec, enc_m, enc_a = load_bundle(version)
        pattern_cols = _load_meta(version)["pattern_cols"]

        df = _prep_df(logs)

        # ---------- Stage‑1 (binary) ----------
        X_txt = vec.transform(df["url"])
        m = df["method"].apply(enc_m.transform).values
        a = df["user_agent"].apply(enc_a.transform).values
        s = df["status_code"].values
        c = df["content_length"].values

        X_meta = sparse.csr_matrix(np.stack([s, c, m, a], 1).astype("float32"))
        X_ptrn = sparse.csr_matrix(extract_url_features(df)[pattern_cols].values.astype("float32"))
        X_bin = sparse.hstack([X_txt, X_meta, X_ptrn]).tocsr()

        p_attack = bin_clf.predict_proba(X_bin)[:, 1]
        is_atk_bin = p_attack >= BIN_THRESH

        # ---------- Stage‑2 (type) ----------
        t_dir = Path(MODEL_DIR) / f"model_v{version}"
        type_available = (t_dir / "xgb_type_clf.pkl").exists()

        if type_available:
            try:
                t_clf = joblib.load(t_dir / "xgb_type_clf.pkl")
                le = joblib.load(t_dir / "label_encoder.pkl")
                X_meta_type = sparse.csr_matrix(np.stack([s, m, a], 1).astype("float32"))
                X_t = sparse.hstack([X_txt, X_ptrn, X_meta_type])

                p_all = t_clf.predict_proba(X_t)
                idx = p_all.argmax(axis=1)
                labels = le.inverse_transform(idx)
                type_scores = p_all[np.arange(len(df)), idx]
                labels = np.where(labels == "normal", None, labels)
            except ValueError as e:
                logger.error(f"Type clf failed: {e}")
                labels = np.array([None] * len(df))
                type_scores = np.zeros(len(df))
            except Exception as e:
                logger.error(f"Type clf 예측 중 오류: {e}")
                labels = np.array([None] * len(df))
                type_scores = np.zeros(len(df))
        else:
            labels = np.array([None] * len(df))
            type_scores = np.zeros(len(df))

        # ---------- Final merge ----------
        results: List[PredictResult] = []
        for i, row in df.iterrows():
            is_attack = bool(is_atk_bin[i])
            attack_score = float(p_attack[i])
            attack_type = None

            label = labels[i]
            score = float(type_scores[i]) if is_attack else 0.0

            label, score, override = _rule_adjust(label, score, row)
            if override:
                # 규칙 기반 오버라이드가 항상 우선
                is_attack = label is not None
                attack_type = label
                attack_score = score
            elif is_attack and label:
                # 오버라이드가 없을 때만 기존 로직
                if score < TYPE_THRESHOLDS.get(label, 0.5):
                    is_attack = False
                    attack_score = score
                else:
                    attack_type = label
                    attack_score = score

            # 유형이 여전히 없는 경우 휴리스틱 기반 추론
            if is_attack and attack_type is None:
                u = row.url.lower()
                if _any_match(u, DT_PATTERNS):
                    attack_type = "directory_traversal"
                elif any(s in u for s in [";", "|", "cmd="]):
                    attack_type = "command_injection"
                elif _any_match(u, XSS_PATTERNS):
                    attack_type = "xss"
                elif _any_match(u, SQLI_LOW):
                    attack_type = "sql_injection"
                else:
                    attack_type = "ssrf_rfi"

            # 결과
            results.append(PredictResult(
                is_attack=is_attack,
                attack_score=attack_score,
                attack_type=attack_type
            ))

        logger.info(f"[PREDICT] {len(results)} logs → v{version}")
        return results
        
    except FileNotFoundError as e:
        logger.error(f"모델 파일을 찾을 수 없습니다: {e}")
        # 캐시 초기화 시도
        clear_bundle_cache()
        # 기본 안전 응답 (모든 로그를 비공격으로 처리)
        return [PredictResult(is_attack=False, attack_score=0.0, attack_type=None) for _ in logs]
    
    except Exception as e:
        logger.error(f"예측 중 오류 발생: {e}")
        # 오류 발생 시 안전한 기본값 반환
        return [PredictResult(is_attack=False, attack_score=0.0, attack_type=None) for _ in logs]