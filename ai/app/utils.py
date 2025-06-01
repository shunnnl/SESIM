from __future__ import annotations

import html, re, warnings
from urllib.parse import unquote

import numpy as np
import pandas as pd
from scipy import sparse

# ─────────────────────────────────────────────
# 1. URL 전처리
# ─────────────────────────────────────────────
def preprocess_url(u: str) -> str:
    if not isinstance(u, str):
        return ""
    try:
        u = unquote(u, errors="ignore")
    except Exception:
        pass
    return html.unescape(u).strip().lower()

# ─────────────────────────────────────────────
# 2. 공격 패턴 정의
# ─────────────────────────────────────────────
PATTERN_REGEX = {
    # ─── SQL Injection
    "has_sql_union"          : r"(?i)\bunion\b.*\bselect\b",
    "has_or_true"            : r"(?i)(\bor\b.+(?:=|like).*?\btrue\b|\b1[ =]1\b)",
    "has_sql_comment"        : r"(?i)(--|#|/\*|\*/)",
    "has_sql_functions"      : r"(?i)(concat|group_concat|substring|ascii|char|sleep|benchmark|waitfor)",
    "has_information_schema" : r"(?i)information_schema",
    "has_sql_injection"      : r"(?i)('.*=|'.*--|'.*#|\d+\s*=\s*\d+)",

    # ─── XSS
    "has_script_tag"     : r"(?i)<script",
    "has_svg_tag"        : r"(?i)<svg\s",
    "has_onload"         : r"(?i)on\w+\s*=",
    "has_javascript"     : r"(?i)javascript:",
    "has_vbscript"       : r"(?i)vbscript:",
    "has_data_uri"       : r"(?i)data:text/html",
    "has_document_write" : r"(?i)document\.(write|writeln)",
    "has_eval_function"  : r"(?i)eval\s*\(",

    # ─── Command / Code Injection
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

    # ─── SSRF / RFI
    "has_file_protocol"  : r"(?i)file://",
    "has_internal_ip"    : r"(?i)(localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.169\.254)",
    "has_private_ip"     : r"(?i)(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)",
    "has_metadata"       : r"(?i)metadata",
    "has_cloud_metadata" : r"(?i)(metadata\.(google|amazonaws|azure))",
    "has_url_param"      : r"(?i)(url|proxy|redirect|path|file|src|target|uri)=",
    "has_include_param"  : r"(?i)(include|require|page|template|view|content)=",
    "has_gopher_dict"    : r"(?i)(gopher|dict|ldap|sftp)://",

    # ─── Directory Traversal
    "has_dir_trav"       : r"\.\./",
    "has_dir_trav_enc"   : r"(?i)(%2e%2e[\/\\]|%252e%252e[\/\\]|%c0%ae%c0%ae)",
    "has_sensitive_file" : r"(?i)(etc\/passwd|etc\/shadow|etc\/hosts|web\.config|wp-config\.php|\.env|config\.php|boot\.ini|win\.ini|system32)",
    "has_null_byte"      : r"%00",
    "has_proc_access"    : r"(?i)(proc\/self|proc\/version|proc\/cmdline)",
    "has_windows_files"  : r"(?i)(windows\/system32|system32\/|boot\.ini|win\.ini)",

    # ─── WebShell Detection
    "has_webshell_upload"    : r"(?i)(upload|fileupload|file_upload).*\.(php|asp|aspx|jsp|py|pl|cgi)(\?|&|$)",
    "has_webshell_eval"      : r"(?i)(eval|assert|exec|system|shell_exec|passthru)\s*\(\s*\$_(GET|POST|REQUEST|COOKIE)\[",
    "has_webshell_functions" : r"(?i)(file_get_contents|file_put_contents|fwrite|fputs|fopen|readfile|include|require).*\$_(GET|POST|REQUEST)",
    "has_webshell_names"     : r"(?i)(c99|r57|b374k|wso|crystal|antichat|tryag|p0wny|mini\.php|webshell|backdoor|shell\.php)",
    "has_webshell_params"    : r"(?i)(\?|&)(cmd|command|exec|shell|system|run|action|do|op|operation)=",
    "has_webshell_base64"    : r"(?i)eval\s*\(\s*base64_decode\s*\(",
    "has_webshell_gzinflate" : r"(?i)eval\s*\(\s*gzinflate\s*\(",
    "has_webshell_chr"       : r"(?i)chr\s*\(\s*\d+\s*\)\s*\.\s*chr",
    "has_webshell_hex"       : r"(?i)\\x[0-9a-f]{2,}",
    "has_webshell_obfuscate" : r"(?i)(\$[a-z_]+\[[\'\"]\w+[\'\"]\]\s*=\s*[\'\"]\w+[\'\"]\s*;){3,}",
    "has_jsp_webshell"       : r"(?i)\.jsp\?.*(?:cmd|exec|shell|system|action|do|op)=",
    "has_jsp_upload"         : r"(?i)/uploads?/.*\.jsp\?",
    "has_asp_webshell"       : r"(?i)\.asp[x]?\?.*(?:cmd|exec|shell|eval)=",
    "has_webshell_dir"       : r"(?i)/shells?/.*\.(php|jsp|asp|aspx)",
    "has_move_uploaded"      : r"(?i)move_uploaded_file\s*\(",
    "has_webshell_vars"      : r"(?i)\$_(GET|POST|REQUEST|COOKIE)\[(\'|\")[^\'\"]*cmd",

    # ─── TLS Probe
    "has_tls_client_hello"   : r"\b(client_hello|server_hello)\b",

    # ─── User-Agent
    "NiktoUA"        : r"(?i)nikto",
    "SqlmapUA"       : r"(?i)sqlmap",
    "NmapUA"         : r"(?i)nmap",
    "BurpUA"         : r"(?i)burp",
    "OWASPZAPUA"     : r"(?i)(owasp.*zap|zaproxy)",
    "CurlUA"         : r"(?i)curl/",
    "WgetUA"         : r"(?i)wget/",

    # ─── General Heuristics
    "has_multiple_dots"  : r"\.{3,}",
    "has_long_param"     : r"[?&]\w+=.{100,}",
    "has_hex_encoding"   : r"(?i)(%[0-9a-f]{2}){5,}",
    "has_unicode_bypass" : r"(?i)(%u[0-9a-f]{4}|\\u[0-9a-f]{4})",
    "has_null_char"      : r"(%00|\\x00|\\0)",
    "has_unusual_method" : r"(?i)(connect|trace|options|patch|propfind|proppatch|mkcol|copy|move|lock|unlock)",
}

# ── 사전-컴파일
PATTERN_REGEX_COMPILED: dict[str, re.Pattern] = {
    k: re.compile(v, re.I) for k, v in PATTERN_REGEX.items()
}

PATTERN_COLS = list(PATTERN_REGEX) + [
    "url_len", "param_count", "special_char_ratio"
]

# ─────────────────────────────────────────────
# 3. 피처 추출
# ─────────────────────────────────────────────
def extract_url_features(df: pd.DataFrame) -> pd.DataFrame:
    urls = df["url"].fillna("")
    feats = pd.DataFrame(index=df.index)

    # 3-1. 정규식 매칭
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=UserWarning)
        for name, patt_obj in PATTERN_REGEX_COMPILED.items():
            feats[name] = urls.str.contains(patt_obj, na=False).astype(np.int8)

    # 3-2. 통계 피처
    url_len = urls.str.len()
    feats["url_len"] = url_len.clip(0, 4096).astype(np.int16)
    feats["param_count"] = urls.str.count(r"[?&]").clip(0, 50).astype(np.int8)
    special_chars = urls.str.count(r"[!@#$%^&*()+=\[\]{}|;:,.<>?]").values
    special_char_ratio = (special_chars / np.maximum(url_len.values, 1) * 100).clip(0, 100)
    feats["special_char_ratio"] = special_char_ratio.astype(np.int8)

    return feats


# ─────────────────────────────────────────────
# 4. 메타 피처 유틸
# ─────────────────────────────────────────────
def build_meta_features(df: pd.DataFrame, enc) -> sparse.csr_matrix:
    methods, agents = enc.transform_method_agent(
        df["method"].tolist(), 
        df["user_agent"].tolist()
    )
    
    status = (df["status_code"] // 100).to_numpy(dtype=np.int8).reshape(-1, 1)

    if "content_length" in df.columns:
        cl_missing = df["content_length"].isna().to_numpy(dtype=np.int8).reshape(-1, 1)
    else:
        cl_missing = np.ones((len(df), 1), dtype=np.int8)
    
    cl_sentinel = np.zeros_like(cl_missing, dtype=np.int8)

    methods = methods.reshape(-1, 1)
    agents = agents.reshape(-1, 1)
    
    meta = np.hstack([methods, agents, status, cl_missing, cl_sentinel])
    return sparse.csr_matrix(meta)

def validate_meta_features(X_meta, expected_dim: int) -> None:
    if X_meta.shape[1] != expected_dim:
        raise ValueError(f"메타 피처 차원 불일치: {X_meta.shape[1]} != {expected_dim}")