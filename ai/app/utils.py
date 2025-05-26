from __future__ import annotations

import html, re, warnings
from urllib.parse import unquote
import pandas as pd

# URL 전처리
def preprocess_url(u: str) -> str:
    """URL → decode → HTML unescape → 공백삭제 → lower"""
    if not isinstance(u, str):
        return ""
    u = unquote(u)
    u = html.unescape(u)
    u = re.sub(r"\s+", "", u)
    return u.lower()

# 패턴 피처 - 6개 공격 유형에 맞춰 정리
PATTERN_REGEX = {
    # TLS Probe
    "has_tls_probe"      : r"(?i)(\\x16\\x03\\x[0-3]|%5cx16%5cx03|tls.*handshake|ssl.*handshake)",
    "has_ssl_test"       : r"(?i)(client.*hello|server.*hello|certificate)",
    
    # SQL Injection
    "has_sql_union"      : r"(?i)\bunion\b.*\bselect\b",
    "has_or_true"        : r"(?i)(\bor\b.+(?:=|like).*?\btrue\b|\b1[ =]1\b)",
    "has_sql_comment"    : r"(?i)(--|#|/\*|\*/)",
    "has_sql_functions"  : r"(?i)(concat|group_concat|substring|ascii|char|sleep|benchmark|waitfor)",
    "has_information_schema": r"(?i)information_schema",
    "has_sql_injection"  : r"(?i)('.*=|'.*--|'.*#|\d+\s*=\s*\d+)",
    
    # XSS
    "has_script_tag"     : r"(?i)<script",
    "has_svg_tag"        : r"(?i)<svg\s",
    "has_onload"         : r"(?i)on\w+\s*=",
    "has_javascript"     : r"(?i)javascript:",
    "has_vbscript"       : r"(?i)vbscript:",
    "has_data_uri"       : r"(?i)data:text/html",
    "has_document_write" : r"(?i)document\.(write|writeln)",
    "has_eval_function"  : r"(?i)eval\s*\(",
    
    # Command Injection (코드 인젝션 포함)
    "has_cmd_sep"        : r"[;&|`$]",
    "has_cmd_binary"     : r"(?i)(rm\s|cat\s|ls\s|pwd\s|whoami\s|id\s|uname\s|ps\s|wget\s|curl\s|bash\s|sh\s|nc\s|netcat\s)", 
    "has_cmd_param"      : r"(?i)(cmd=|command=|exec=|shell=|system=)",
    "has_win_cmd"        : r"(?i)(cmd\.exe|powershell|dir\s|type\s|copy\s|del\s|tasklist|ipconfig|net\s)",
    "has_env_var"        : r"(\$\{.*\}|%.*%|\$[A-Z_][A-Z0-9_]*)",
    "has_redirection"    : r"(>>|<<|>\s|<\s)",
    "has_pipe_chain"     : r"\|\s*\w+",
    "has_command_subst"  : r"(\$\(|\`.*\`)",
    "has_php_tags"       : r"(?i)<\?php",
    "has_php_functions"  : r"(?i)(file_get_contents|file_put_contents|fopen|readfile|highlight_file|show_source)",
    "has_base64_decode"  : r"(?i)base64_decode",
    "has_code_eval"      : r"(?i)(eval|assert|create_function)\s*\(",
    
    # SSRF / RFI
    "has_file_protocol"  : r"(?i)file://",
    "has_internal_ip"    : r"(?i)(localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.169\.254)",
    "has_private_ip"     : r"(?i)(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)",
    "has_metadata"       : r"(?i)metadata",
    "has_cloud_metadata" : r"(?i)(metadata\.(google|amazonaws|azure))",
    "has_url_param"      : r"(?i)(url|proxy|redirect|path|file|src|target|uri)=",
    "has_include_param"  : r"(?i)(include|require|page|template|view|content)=",
    "has_gopher_dict"    : r"(?i)(gopher|dict|ldap|sftp)://",
    
    # Directory Traversal
    "has_dir_trav"       : r"\.\./",
    "has_dir_trav_enc"   : r"(?i)(%2e%2e[\/\\]|%252e%252e[\/\\]|%c0%ae%c0%ae)", 
    "has_sensitive_file" : r"(?i)(etc\/passwd|etc\/shadow|etc\/hosts|web\.config|wp-config\.php|\.env|config\.php|boot\.ini|win\.ini|system32)",
    "has_null_byte"      : r"%00",
    "has_proc_access"    : r"(?i)(proc\/self|proc\/version|proc\/cmdline)",
    "has_windows_files"  : r"(?i)(windows\/system32|system32\/|boot\.ini|win\.ini)",
    
    # User Agent 기반 탐지
    "NiktoUA"            : r"(?i)nikto",
    "SqlmapUA"           : r"(?i)sqlmap",
    "NmapUA"             : r"(?i)nmap",
    "BurpUA"             : r"(?i)burp",
    "OWASPZAPUA"         : r"(?i)(owasp.*zap|zaproxy)",
    "CurlUA"             : r"(?i)curl/",
    "WgetUA"             : r"(?i)wget/",
    
    # 일반적인 공격 패턴
    "has_multiple_dots"  : r"\.{3,}",
    "has_long_param"     : r"[?&]\w+=.{100,}",  # 비정상적으로 긴 파라미터
    "has_hex_encoding"   : r"(?i)(%[0-9a-f]{2}){5,}",  # 과도한 URL 인코딩
    "has_unicode_bypass" : r"(?i)(%u[0-9a-f]{4}|\\u[0-9a-f]{4})",
    "has_null_char"      : r"(%00|\\x00|\\0)",
    
    # HTTP 메소드 이상
    "has_unusual_method" : r"(?i)(connect|trace|options|patch|propfind|proppatch|mkcol|copy|move|lock|unlock)",
}

# URL 길이 계산 추가
PATTERN_COLS = list(PATTERN_REGEX) + ["url_len", "param_count", "special_char_ratio"]

def extract_url_features(df: pd.DataFrame) -> pd.DataFrame:
    """확장된 피처 추출: 정규표현식 패턴 + 통계적 피처"""
    urls = df["url"].fillna("")
    feats = pd.DataFrame(index=df.index)
    
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=UserWarning)
        
        # 정규표현식 기반 피처
        for name, rx in PATTERN_REGEX.items():
            feats[name] = urls.str.contains(rx, regex=True, na=False).astype("int8")
    
    # 통계적 피처
    feats["url_len"] = urls.str.len().clip(0, 4096).astype("int16")
    
    # 파라미터 개수 (쿼리 스트링의 파라미터 수)
    feats["param_count"] = urls.str.count("[?&]").clip(0, 50).astype("int8")
    
    # 특수문자 비율 (URL에서 특수문자가 차지하는 비율)
    special_chars = urls.str.count(r"[!@#$%^&*()+=\[\]{}|;:,.<>?]")
    url_lengths = urls.str.len().replace(0, 1)  # 0으로 나누기 방지
    feats["special_char_ratio"] = (special_chars / url_lengths * 100).clip(0, 100).astype("int8")
    
    return feats

def is_suspicious_user_agent(user_agent: str) -> bool:
    """의심스러운 User-Agent 탐지"""
    if not user_agent:
        return True
    
    ua_lower = user_agent.lower()
    
    # 공격 도구 탐지
    attack_tools = [
        "nikto", "sqlmap", "nmap", "burp", "owasp", "zap", "zaproxy",
        "gobuster", "dirb", "dirbuster", "wfuzz", "ffuf", "hydra",
        "medusa", "john", "hashcat", "metasploit", "nessus", "openvas"
    ]
    
    if any(tool in ua_lower for tool in attack_tools):
        return True
    
    # 비정상적으로 짧거나 긴 User-Agent
    if len(user_agent) < 10 or len(user_agent) > 500:
        return True
    
    # 의심스러운 패턴
    suspicious_patterns = [
        r"^[a-zA-Z]$",  # 단일 문자
        r"^\d+$",       # 숫자만
        r"^test",       # test로 시작
        r"^python",     # python 스크립트
        r"^curl",       # curl 도구
        r"^wget",       # wget 도구
    ]
    
    return any(re.match(pattern, ua_lower) for pattern in suspicious_patterns)

def extract_domain_features(urls: pd.Series) -> pd.DataFrame:
    """도메인 기반 피처 추출"""
    features = pd.DataFrame(index=urls.index)
    
    # 도메인 길이
    domains = urls.str.extract(r"https?://([^/]+)")[0].fillna("")
    features["domain_len"] = domains.str.len().astype("int16")
    
    # 서브도메인 개수
    features["subdomain_count"] = domains.str.count("\.").clip(0, 10).astype("int8")
    
    # 숫자 도메인 (IP 주소 등)
    features["is_ip_domain"] = domains.str.contains(r"^\d+\.\d+\.\d+\.\d+$", regex=True, na=False).astype("int8")
    
    # 의심스러운 TLD
    suspicious_tlds = ["tk", "ml", "ga", "cf", "bit", "onion"]
    features["suspicious_tld"] = domains.str.contains("|".join(suspicious_tlds), regex=True, na=False).astype("int8")
    
    return features