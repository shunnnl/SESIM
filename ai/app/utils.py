import re
import pandas as pd
from urllib.parse import unquote

def preprocess_url(url: str) -> str:
    if not url:
        return ""
    url = unquote(str(url))
    url = url.replace('+', ' ') 
    return url

def extract_url_features(df: pd.DataFrame, url_column: str = "url") -> pd.DataFrame:
    if url_column not in df.columns:
        raise ValueError(f"URL 컬럼 '{url_column}'이 데이터프레임에 없습니다.")
    
    df = df.copy()
    df[url_column] = df[url_column].fillna("").astype(str)

    df['url_len'] = df[url_column].str.len()
    df['has_select'] = df[url_column].str.contains(r'\bselect\b', case=False).fillna(False).astype(int)
    df['has_alert'] = df[url_column].str.contains('alert', case=False).fillna(False).astype(int)
    df['has_script'] = df[url_column].str.contains('script', case=False).fillna(False).astype(int)
    df['has_div'] = df[url_column].str.contains(r'\bdiv\b', case=False).fillna(False).astype(int)
    df['has_dotdot'] = df[url_column].str.contains(r'\.\./').fillna(False).astype(int)
    df['has_percent'] = df[url_column].str.contains('%').fillna(False).astype(int)
    df['has_or'] = df[url_column].str.contains(r'\bOR\b', case=False).fillna(False).astype(int)
    df['has_and'] = df[url_column].str.contains(r'\bAND\b', case=False).fillna(False).astype(int)
    df['has_eq'] = df[url_column].str.contains('=', case=False).fillna(False).astype(int)
    df['has_quote'] = df[url_column].str.contains(r"['\"]").fillna(False).astype(int)
    df['has_union'] = df[url_column].str.contains(r'\bUNION\b', case=False).fillna(False).astype(int)
    df['has_dash'] = df[url_column].str.contains('--').fillna(False).astype(int)
    df['has_admin'] = df[url_column].str.contains(r'\badmin\b', case=False).fillna(False).astype(int)

    return df
