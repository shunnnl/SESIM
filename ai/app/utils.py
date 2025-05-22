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

# 패턴 피처
PATTERN_REGEX = {
    # SQLi
    "has_sql_union"    : r"(?i)\bunion\b.*\bselect\b",
    "has_or_true"      : r"(?i)(\bor\b.+(?:=|like).*?\btrue\b|\b1[ =]1\b)",
    
    # XSS
    "has_script_tag"   : r"(?i)<script",
    "has_svg_tag"      : r"(?i)<svg\s",
    "has_onload"       : r"(?i)onload=",
    
    # Command / RCE - 확장
    "has_cmd_sep"      : r"[;&|`$]",
    "has_cmd_binary"   : r"(?i)(rm\s|cat\s|ls\s|wget\s|curl\s|bash\s|sh\s|nc\s)", 
    "has_cmd_param"    : r"(?i)(cmd=|command=|exec=|shell=|system=)",
    
    # SSRF / RFI
    "has_php_eval"     : r"(?i)<\?php.*?eval",
    "has_php_exec"     : r"(?i)(<\?php.*?(system|exec|passthru|shell_exec)|\beval\s*\()",
    "has_tls_probe"    : r"\\x16\\x03\\x01",
    
    # Directory Traversal - 확장
    "has_dir_trav"     : r"\.\./",
    "has_dir_trav_enc" : r"(?i)(%2e%2e[\/\\]|%252e%252e[\/\\])", 
    "has_sensitive_file": r"(?i)(etc\/passwd|etc\/shadow|etc\/hosts|web\.config|wp-config\.php|\.env|config\.php)",
    "has_null_byte"    : r"%00",
    
    # UA 토큰
    "NiktoUA"          : r"(?i)nikto",
}
PATTERN_COLS = list(PATTERN_REGEX) + ["url_len"]

def extract_url_features(df: pd.DataFrame) -> pd.DataFrame:
    """PATTERN_COLS 만큼 0/1 + url_len 반환"""
    urls = df["url"].fillna("")
    feats = pd.DataFrame(index=df.index)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=UserWarning)
        for name, rx in PATTERN_REGEX.items():
            feats[name] = urls.str.contains(rx, regex=True, na=False).astype("int8")
    feats["url_len"] = urls.str.len().clip(0, 4096).astype("int16")
    return feats