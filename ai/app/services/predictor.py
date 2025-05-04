import logging
import pandas as pd
from typing import List
from app.dto.request import RawLog
from app.dto.response import PredictResult
from scipy.sparse import hstack, csr_matrix
from app.utils import preprocess_url, extract_url_features

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("predictor")

def predict_logs(model, vectorizer, logs: List[RawLog], method_encoder=None, agent_encoder=None, batch_size: int = 500) -> List[PredictResult]:

    try:
        if not logs:
            logger.warning("빈 로그 리스트가 입력되었습니다.")
            return []
        
        log_dicts = [log.dict() for log in logs]
        df = pd.DataFrame(log_dicts)
        
        required_fields = ['method', 'url', 'status_code']
        for field in required_fields:
            if field not in df.columns:
                error_msg = f"필수 필드 '{field}'가 로그 데이터에 없습니다."
                logger.error(error_msg)
                raise ValueError(error_msg)

        df['method'] = df['method'].fillna('GET').astype(str)
        df['status_code'] = pd.to_numeric(df['status_code'], errors='coerce').fillna(200).astype(int)
        df['url'] = df['url'].fillna('').astype(str)
        
        df['url'] = df['url'].apply(preprocess_url)
        
        df = extract_url_features(df)
        
        if len(df) > batch_size:
            logger.info(f"대용량 로그 데이터 ({len(df)}개 로그) 배치 처리 시작")
            
            all_results = []
            
            for i in range(0, len(df), batch_size):
                end_idx = min(i + batch_size, len(df))
                batch_df = df.iloc[i:end_idx]
                
                batch_results = _process_batch(model, vectorizer, batch_df, method_encoder, agent_encoder)
                all_results.extend(batch_results)
                
                logger.info(f"배치 처리 진행: {end_idx}/{len(df)} 완료")
                
            return all_results
        else:
            return _process_batch(model, vectorizer, df, method_encoder, agent_encoder)
            
    except Exception as e:
        logger.error(f"예측 중 예기치 않은 오류 발생: {str(e)}")
        return [PredictResult(is_attack=False, attack_score=0.0) for _ in logs]


def _process_batch(model, vectorizer, df: pd.DataFrame, method_encoder=None, agent_encoder=None) -> List[PredictResult]:

    df['method'] = df['method'].fillna('GET').astype(str)
    df['user_agent'] = df['user_agent'].fillna('').astype(str)
    df['status_code'] = pd.to_numeric(df['status_code'], errors='coerce').fillna(200).astype(int)
    
    try:
        X_text = vectorizer.transform(df['url'])
    except Exception as e:
        logger.error(f"URL 벡터화 실패: {str(e)}")
        raise RuntimeError(f"URL 벡터화 실패: {str(e)}")

    try:
        X_other = df[['status_code']].copy()
        X_other['method_enc'] = df['method'].apply(lambda x: method_encoder.transform(x) if method_encoder else 0)
        X_other['agent_enc'] = df['user_agent'].apply(lambda x: agent_encoder.transform(x) if agent_encoder else 0)
    except Exception as e:
        logger.error(f"특성 생성 중 오류: {str(e)}")
        raise RuntimeError(f"특성 생성 중 오류: {str(e)}")
    
    try:
        X_all = pd.concat([pd.DataFrame(X_text.toarray()), X_other], axis=1)

    except Exception as e:
        logger.error(f"특성 결합 중 오류: {str(e)}")
        raise RuntimeError(f"특성 결합 중 오류: {str(e)}")
    
    try:
        y_pred = model.predict(X_all)
        probas = model.predict_proba(X_all)[:, 1]
    except Exception as e:
        logger.error(f"모델 예측 실패: {str(e)}")
        raise RuntimeError(f"모델 예측 실패: {str(e)}")

    # 결과 반환
    results = []
    for idx in range(len(df)):
        results.append(PredictResult(
            is_attack=bool(y_pred[idx]),
            attack_score=float(probas[idx])
        ))
    
    logger.info(f"{len(results)}개 로그에 대한 예측 완료")
    return results