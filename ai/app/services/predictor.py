from __future__ import annotations

import logging
import re
import numpy as np
import pandas as pd
from scipy import sparse
from typing import List

from app.core.registry import load_bundle, _latest_version, has_trained_model
from app.core.config import BIN_THRESH, TYPE_THRESHOLDS
from app.utils import preprocess_url, extract_url_features
from app.dto.request import RawLog
from app.dto.response import PredictResult

logger = logging.getLogger(__name__)

# ========== 균형 개선된 패턴들 ==========

# TLS 프로브 - 더 엄격한 패턴 (과탐지 방지)
TLS_PROBE_PATTERNS = [re.compile(p, re.I) for p in [
    r"\\x16\\x03\\x[0-3]",  # 실제 TLS 핸드셰이크 바이너리
    r"%5cx16%5cx03",        # URL 인코딩된 TLS 패턴
    r"\x16\x03",            # 바이너리 TLS 시그니처
]]

# TLS 관련 정상 요청 패턴 (화이트리스트)
TLS_LEGITIMATE_PATTERNS = [re.compile(p, re.I) for p in [
    r"^/\.well-known/",          # ACME/Let's Encrypt
    r"^/\.git/",                 # Git 저장소
    r"^/config\.",               # 설정 파일
    r"^/ssl/",                   # SSL 인증서 디렉토리
    r"^/certs?/",                # 인증서 디렉토리
    r"^/security\.txt$",         # 보안 정책 파일
    r"^/robots\.txt$",           # 로봇 파일
    r"^/sitemap\.xml$",          # 사이트맵
]]

# 디렉터리 탐색 - 탐지율 향상
DT_PATTERNS = [re.compile(p, re.I) for p in [
    r"(\.\./){2,}",              # 2번 이상 상위 디렉터리
    r"\.\.[\\/].*\.\.[\\/]",     # 다중 traversal
    r"%2e%2e[\\/]",              # URL 인코딩
    r"%252e%252e[\\/]",          # 이중 인코딩
    r"%c0%ae%c0%ae[\\/]",        # 유니코드 우회
]]

SENSITIVE_FILES = [
    "etc/passwd", "etc/shadow", "etc/hosts", "etc/group", "etc/fstab",
    "proc/self/environ", "proc/version", "proc/cmdline",
    "wp-config.php", "config.php", ".env", "web.config", ".htaccess", "wp-config.inc",
    "boot.ini", "win.ini", "system32/config/sam", "windows/system32",
    "application.properties", "database.yml", "secrets.yml"
]

# 명령어 삽입 - 탐지율 향상을 위한 확장
COMMAND_INJECTION_PATTERNS = [re.compile(p, re.I) for p in [
    # 고위험 명령어 구분자 (가중치 높음)
    r"[;&|`\$]\s*(rm|cat|ls|pwd|whoami|id|wget|curl|nc|bash|sh|cmd|powershell)",
    r"\|\||\&&",
    r"\$\([^)]*\)",
    r"`[^`]+`",
    
    # 명령어 주입 파라미터 (확장)
    r"(cmd|command|exec|shell|system|run)=",
    r"(bash|sh|zsh|fish)[\s=]",
    
    # Linux/Unix 명령어 (단독 실행)
    r"\b(rm|cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|wget|curl|nc|ncat|telnet)\s+",
    r"\b(chmod|chown|mount|umount|kill|killall|top|htop|tail|head|grep|awk|sed)\s+",
    
    # Windows 명령어 (단독 실행)  
    r"\b(cmd|powershell|dir|type|copy|move|del|rd|md|attrib|tasklist|taskkill)\s+",
    r"\b(systeminfo|ipconfig|net|sc|reg|wmic|certutil)\s+",
    
    # 환경변수 및 리다이렉션
    r"\$\{[A-Z_][A-Z0-9_]*\}",
    r"%[A-Z_][A-Z0-9_]*%",
    r">\s*[/\\]",
    r"<\s*[/\\]",
    
    # PHP/웹 코드 실행 (command_injection으로 분류)
    r"<\?php",
    r"(?:system|exec|passthru|shell_exec|popen)\s*\(",
    r"\beval\s*\(",
    r"base64_decode\s*\(",
]]

# XSS - 확장된 패턴
XSS_PATTERNS = [re.compile(p, re.I) for p in [
    r"<script", r"<svg", r"<img", r"<iframe", r"<object", r"<embed",
    r"javascript:", r"data:text/html", r"vbscript:", r"expression\s*\(",
    r"on\w+\s*=", r"alert\s*\(", r"eval\s*\(", r"document\.",
    r"window\.", r"location\.", r"top\.", r"parent\.", r"frames\.",
    r"innerHTML", r"outerHTML", r"document\.write"
]]

# SQL 인젝션 - 탐지율 향상
SQLI_HIGH = [re.compile(p, re.I) for p in [
    # 고전적 SQL 인젝션
    r"'.*--",
    r"'.*#", 
    r"'\s*or\s*'",
    r"'\s*or\s*1\s*=\s*1",
    r"1\s*=\s*1",
    r"'=\'",
    
    # UNION 기반
    r"union\s+select",
    r"union\s+all\s+select",
    
    # 구조 조작
    r"drop\s+table",
    r"delete\s+from",
    r"update\s+.*\s+set",
    r"insert\s+into",
    r"truncate\s+table",
    
    # 함수 기반 인젝션
    r"sleep\s*\(",
    r"benchmark\s*\(",
    r"waitfor\s+delay",
    r"pg_sleep\s*\(",
    
    # 정보 수집
    r"information_schema",
    r"sys\.",
    r"master\.",
    r"msdb\.",
    
    # 파일 조작
    r"into\s+outfile",
    r"load_file\s*\(",
    r"load\s+data",
]]

SQLI_LOW = [re.compile(p, re.I) for p in [
    r"select\s+.*\s+from",
    r"'\s*and\s*",
    r"'\s*or\s*",
    r"--",
    r";.*select",
    r"\bor\b.*\d\s*=\s*\d",
    r"\band\b.*\d\s*=\s*\d",
    r"order\s+by\s+\d+",
    r"group\s+by\s+\d+",
]]

SQL_KEYWORDS = ["select", "from", "where", "group by", "order by", "having", "join", "union"]

# SSRF/RFI - 대폭 확장된 패턴
SSRF_PATTERNS = [re.compile(p, re.I) for p in [
    # 내부 IP 대역
    r"(?:file|https?|ftp|gopher|dict|ldap|sftp)://(?:169\.254\.169\.254|localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)",
    # URL 인코딩된 내부 IP
    r"(?:file|https?|ftp|gopher|dict|ldap|sftp)://.*(?:%31%36%39%2e%32%35%34%2e%31%36%39%2e%32%35%34|%31%32%37%2e%30%2e%30%2e%31)",
    # 메타데이터 서비스
    r"metadata", r"169\.254\.169\.254", r"metadata\.google\.internal",
    r"169\.254\.169\.254/latest/meta-data", r"instance-data/latest/meta-data",
    # 로컬 접근
    r"localhost", r"127\.0\.0\.1", r"0\.0\.0\.0", r"0x7f000001", r"2130706433",
    # 프로토콜 혼용
    r"file://", r"dict://", r"gopher://", r"ldap://", r"sftp://",
    # 파라미터 기반 SSRF
    r"(url|proxy|redirect|path|file|src|target|uri|link|goto|redir|forward|fetch|load|include)=.*(?:file:|https?://)",
    # RFI 패턴
    r"(include|require|page|template|view|content)=.*(?:https?://|ftp://)",
    # 클라우드 메타데이터
    r"metadata\.amazonaws\.com", r"metadata\.azure\.com", r"metadata\.gce\.internal"
]]

# 정적 리소스 화이트리스트 - 확장
STATIC_PATTERNS = [re.compile(p) for p in [
    r"^/static/.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)(\?.*)?$",
    r"^/assets/.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)(\?.*)?$",
    r"^/dist/.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)(\?.*)?$",
    r"^/build/.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)(\?.*)?$",
    r"^/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|xml|txt|robots\.txt|sitemap\.xml)(\?.*)?$",
    r"^/favicon\.ico$", r"^/robots\.txt$", r"^/sitemap\.xml$"
]]

# 화이트리스트 패턴 - 정상 동작 보호
WHITELIST_PATTERNS = {
    'health_check': [re.compile(p, re.I) for p in [
        r"^/(health|healthz|ping|status|ready|live|metrics|actuator)/?$",
        r"^/api/(health|status|version|info)/?$",
        r"^/_health/?$", r"^/monitoring/.*"
    ]],
    
    'admin_tools': [re.compile(p, re.I) for p in [
        r"^/(admin|dashboard|panel|console|manager)/?",
        r"^/wp-admin/.*", r"^/phpmyadmin/.*", r"^/adminer/.*"
    ]],
    
    'api_endpoints': [re.compile(p, re.I) for p in [
        r"^/api/v\d+/.*", r"^/rest/.*", r"^/graphql/?$",
        r"^/webhook/.*", r"^/callback/.*"
    ]],
    
    'search_endpoints': [re.compile(p, re.I) for p in [
        r"^/(search|find|query|autocomplete)/?",
        r"^/api/(search|find|query)/?",
        r"/search\?", r"/find\?"
    ]],
    
    'legitimate_ua': [re.compile(p, re.I) for p in [
        r"kube-probe", r"prometheus", r"grafana", r"datadog", r"newrelic",
        r"pingdom", r"uptime", r"nagios", r"zabbix", r"elasticsearch",
        r"logstash", r"beats", r"fluentd", r"google-cloud", r"aws-load-balancer",
        r"mozilla.*firefox", r"mozilla.*chrome", r"mozilla.*safari", r"mozilla.*edge"
    ]]
}

# 헬퍼 함수: 정규표현식 리스트에 대해 문자열 검색
def _any_match(text: str, patterns: list[re.Pattern]) -> bool:
    return any(p.search(text) for p in patterns)

def _is_whitelisted(url: str, user_agent: str, method: str) -> tuple[bool, str]:
    """화이트리스트 검사 - (is_whitelisted, reason)"""
    path, _, query = url.lower().partition("?")
    ua_lower = user_agent.lower()
    
    # 헬스체크 엔드포인트
    if _any_match(path, WHITELIST_PATTERNS['health_check']):
        if _any_match(ua_lower, WHITELIST_PATTERNS['legitimate_ua']) or method == "HEAD":
            return True, "health_check"
    
    # 정적 자원
    if _any_match(path, STATIC_PATTERNS):
        # 쿼리에 명백한 공격 패턴이 없으면 허용
        if not (_any_match(query, SQLI_HIGH) or _any_match(query, XSS_PATTERNS) or 
                _any_match(query, COMMAND_INJECTION_PATTERNS)):
            return True, "static_resource"
    
    # 검색 엔드포인트에서 SQL 키워드는 정상
    if _any_match(path, WHITELIST_PATTERNS['search_endpoints']):
        return True, "search_endpoint"
    
    # API 엔드포인트 - 정상적인 브라우저/도구 요청
    if _any_match(path, WHITELIST_PATTERNS['api_endpoints']):
        if _any_match(ua_lower, WHITELIST_PATTERNS['legitimate_ua']):
            return True, "api_endpoint"
    
    return False, ""

def _rule_adjust(label: str | None, score: float, row: pd.Series) -> tuple[str | None, float, bool]:
    """Return (label, score, override_attack) - 탐지 균형 개선"""
    url: str = row.url.lower()
    method: str = row.method.upper()
    user_agent: str = row.user_agent.lower()
    status_code: int = row.status_code

    path, _, query = url.partition("?")

    # 화이트리스트 검사 먼저 수행
    is_whitelisted, whitelist_reason = _is_whitelisted(url, user_agent, method)
    if is_whitelisted:
        # 화이트리스트에 있더라도 명백한 고위험 패턴은 탐지
        if _any_match(url, SQLI_HIGH + COMMAND_INJECTION_PATTERNS[:3]):
            logger.warning(f"화이트리스트 우회 시도 탐지: {whitelist_reason} - {url[:100]}")
        else:
            return None, min(score, 0.3), False

    # 1) 고신뢰 SQL 인젝션 - 최우선 (탐지율 향상)
    if _any_match(url, SQLI_HIGH):
        return "sql_injection", max(score, 0.95), True

    # 2) 명령어 삽입 - 우선순위 상승 (탐지율 향상)
    if _any_match(url, COMMAND_INJECTION_PATTERNS):
        # 헬스체크나 모니터링 도구는 예외
        if not _any_match(user_agent, WHITELIST_PATTERNS['legitimate_ua']):
            return "command_injection", max(score, 0.90), True

    # 3) 디렉터리 탐색 - 우선순위 상승 (탐지율 향상)
    dt_hit = _any_match(url, DT_PATTERNS) or any(f in url for f in SENSITIVE_FILES)
    if dt_hit:
        # 명령어 삽입과 결합된 경우 command_injection으로
        has_cmd = _any_match(url, COMMAND_INJECTION_PATTERNS[:5])
        if has_cmd:
            return "command_injection", max(score, 0.95), True
        else:
            return "directory_traversal", max(score, 0.85), True

    # 4) TLS 프로브 - 더 엄격한 조건 (과탐지 방지)
    # 정상 TLS 관련 요청은 제외
    if not _any_match(path, TLS_LEGITIMATE_PATTERNS):
        if (_any_match(url, TLS_PROBE_PATTERNS) or 
            (method in {"BADTLS", "UNKNOWN", "CONNECT"} and "\\x16\\x03" in url) or
            (status_code in [400, 404, 502] and "\\x16\\x03" in url)):
            return "tls_probe", max(score, 0.85), True

    # 5) XSS patterns
    if _any_match(url, XSS_PATTERNS):
        return "xss", max(score, 0.80), True

    # 6) SSRF/RFI 탐지
    if _any_match(url, SSRF_PATTERNS):
        return "ssrf_rfi", max(score, 0.80), True

    # 7) 저신뢰 SQLi - 탐지율 향상
    if _any_match(url, SQLI_LOW):
        # 검색 컨텍스트에서는 더 엄격하게 판단
        is_search_ctx = _any_match(path, WHITELIST_PATTERNS['search_endpoints'])
        if is_search_ctx:
            # 검색에서도 위험한 패턴이 있으면 탐지
            dangerous_patterns = ["'", "\"", "--", "#", "union", "drop", "delete", " or ", " and "]
            if any(dangerous in url for dangerous in dangerous_patterns):
                return "sql_injection", max(score, 0.75), True
            return None, min(score, 0.4), False
        else:
            return "sql_injection", max(score, 0.80), True

    # 8) SQLMap 사용자 에이전트
    if 'sqlmap' in user_agent:
        if not re.match(r"^/(products|items|goods)/\d+$", path):
            return "sql_injection", max(score, 0.85), True

    # 9) 정상 요청 패턴 추가 보호
    if method == "POST" and re.match(r"^/(login|signin|auth|api/login)", path):
        if _any_match(user_agent, WHITELIST_PATTERNS['legitimate_ua']):
            return None, min(score, 0.4), False

    # 10) 관리자 도구 접근 (정상적인 경우)
    if _any_match(path, WHITELIST_PATTERNS['admin_tools']):
        if (_any_match(user_agent, WHITELIST_PATTERNS['legitimate_ua']) and 
            status_code in [200, 301, 302, 404]):
            # 명백한 공격 패턴이 없으면 허용
            if not (_any_match(url, SQLI_HIGH) or _any_match(url, COMMAND_INJECTION_PATTERNS[:5])):
                return None, min(score, 0.5), False

    return label, score, False

def _infer_attack_type_from_url(url: str) -> str:
    """URL 기반 공격 유형 추론 (6개 유형만, 우선순위 조정)"""
    # SQL Injection 패턴 (우선순위 1)
    if _any_match(url, SQLI_LOW):
        return "sql_injection"
    
    # Command Injection 패턴 (우선순위 2)
    elif _any_match(url, COMMAND_INJECTION_PATTERNS):
        return "command_injection"
    
    # Directory Traversal 패턴 (우선순위 3)
    elif _any_match(url, DT_PATTERNS):
        return "directory_traversal"
    
    # XSS 패턴 (우선순위 4)
    elif _any_match(url, XSS_PATTERNS):
        return "xss"
    
    # SSRF/RFI 패턴 (우선순위 5)
    elif _any_match(url, SSRF_PATTERNS):
        return "ssrf_rfi"
    
    # TLS Probe 패턴 (우선순위 6)
    elif _any_match(url, TLS_PROBE_PATTERNS):
        return "tls_probe"
    
    else:
        return "unknown"

def _prep_df(logs: List[RawLog]) -> pd.DataFrame:
    """전처리 함수"""
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

# ========== 메인 예측 함수 (통합 모델 사용) ==========

def predict_logs(logs: List[RawLog], version: str | None = None) -> List[PredictResult]:
    if not logs:
        return []

    try:
        # 모델 존재 여부 확인
        if not has_trained_model():
            logger.warning("학습된 모델이 없습니다. 모든 요청을 안전으로 처리합니다.")
            return [PredictResult(is_attack=False, attack_score=0.0, attack_type=None) for _ in logs]

        version = version or _latest_version()
        if version is None:
            logger.warning("사용 가능한 모델 버전이 없습니다.")
            return [PredictResult(is_attack=False, attack_score=0.0, attack_type=None) for _ in logs]
            
        # 통합 번들 로드
        bundle = load_bundle(version)
        if bundle is None:
            logger.warning("모델 로드에 실패했습니다. 안전 모드로 처리합니다.")
            return [PredictResult(is_attack=False, attack_score=0.0, attack_type=None) for _ in logs]

        df = _prep_df(logs)

        # ---------- 피처 추출 ----------
        # 1) 텍스트 피처
        X_txt = bundle.vectorizer.transform(df["url"])

        # 2) 메타 피처 (통합 인코더 사용)
        m_idx, a_idx = bundle.encoder.transform_method_agent(
            df["method"].tolist(),
            df["user_agent"].tolist()
        )
        
        s = df["status_code"].values
        c = df["content_length"].values
        X_meta = sparse.csr_matrix(np.stack([m_idx, a_idx, s, c], 1).astype("float32"))

        # 3) 패턴 피처
        try:
            pattern_cols = bundle.meta.get("pattern_cols", [])
            if pattern_cols:
                X_ptrn = sparse.csr_matrix(extract_url_features(df)[pattern_cols].values.astype("float32"))
            else:
                X_ptrn = sparse.csr_matrix(extract_url_features(df).values.astype("float32"))
        except Exception as e:
            logger.warning(f"패턴 피처 추출 실패: {e}")
            X_ptrn = sparse.csr_matrix((len(df), 0))

        # 4) 모든 피처 결합
        X_bin = sparse.hstack([X_txt, X_meta, X_ptrn]).tocsr()

        # ---------- Stage-1 (binary) ----------
        p_attack = bundle.binary_classifier.predict_proba(X_bin)[:, 1]
        is_atk_bin = p_attack >= BIN_THRESH

        # ---------- Stage-2 (type) ----------
        labels = np.array([None] * len(df))
        type_scores = np.zeros(len(df))

        if bundle.type_classifier is not None:
            try:
                # 공격으로 예측된 데이터에 대해서만 유형 분류 수행
                attack_indices = np.where(is_atk_bin)[0]
                if len(attack_indices) > 0:
                    X_type = X_bin[attack_indices]
                    p_all = bundle.type_classifier.predict_proba(X_type)
                    idx = p_all.argmax(axis=1)
                    
                    # 인코더를 통해 라벨 복원
                    predicted_labels = bundle.encoder.inverse_transform_attack_types(idx)
                    predicted_scores = p_all[np.arange(len(attack_indices)), idx]
                    
                    # 결과를 원래 인덱스에 매핑
                    for i, (orig_idx, label, score) in enumerate(zip(attack_indices, predicted_labels, predicted_scores)):
                        if label != "unknown":
                            labels[orig_idx] = label
                            type_scores[orig_idx] = score
                            
            except Exception as e:
                logger.error(f"유형 분류 예측 중 오류: {e}")

        # ---------- 규칙 기반 후처리 및 최종 결과 ----------
        results: List[PredictResult] = []
        for i, row in df.iterrows():
            is_attack = bool(is_atk_bin[i])
            attack_score = float(p_attack[i])
            attack_type = None

            label = labels[i]
            score = float(type_scores[i]) if is_attack else 0.0

            # 규칙 기반 조정
            label, score, override = _rule_adjust(label, score, row)
            
            if override:
                # 규칙 기반 오버라이드가 항상 우선
                is_attack = label is not None
                attack_type = label
                attack_score = score
            elif is_attack and label:
                # 오버라이드가 없을 때만 기존 로직
                threshold = TYPE_THRESHOLDS.get(label, 0.5)
                if score < threshold:
                    is_attack = False
                    attack_score = score
                else:
                    attack_type = label
                    attack_score = score

            # 유형이 여전히 없는 경우 휴리스틱 기반 추론
            if is_attack and attack_type is None:
                attack_type = _infer_attack_type_from_url(row.url.lower())

            results.append(PredictResult(
                is_attack=is_attack,
                attack_score=attack_score,
                attack_type=attack_type
            ))

        logger.info(f"[PREDICT] {len(results)} logs → v{version} (균형 개선 모델)")
        return results
        
    except Exception as e:
        logger.error(f"예측 중 오류 발생: {e}")
        return [PredictResult(is_attack=False, attack_score=0.0, attack_type=None) for _ in logs]