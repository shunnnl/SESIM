import re
import json
import pandas as pd
import numpy as np
from urllib.parse import unquote
from app.core.config import DATA_DIR
from app.core.registry import get_available_model_versions
import logging

logger = logging.getLogger(__name__)

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

def track_model_performance(model, eval_data, model_version):

    from app.services.trainer import ModelPerformanceTracker
    tracker = ModelPerformanceTracker()
    return tracker.track_model_performance(model, eval_data, model_version)

def evaluate_model(model, eval_data):

    from app.services.trainer import ModelPerformanceTracker
    tracker = ModelPerformanceTracker()
    return tracker._evaluate_model(model, eval_data)

def save_json(data, file_path):

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"JSON 저장 오류: {str(e)}")
        return False

def load_json(file_path):

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"JSON 로드 오류: {str(e)}")
        return None

def chunk_dataframe(df, chunk_size=10000):

    chunks = []
    for i in range(0, len(df), chunk_size):
        chunks.append(df.iloc[i:i+chunk_size].copy())
    return chunks