import joblib
import logging
import pandas as pd
from typing import Dict
from pathlib import Path
from xgboost import XGBClassifier
from app.core.encoder import SafeEncoder
from app.core.config import SAVE_MODEL_VERSION
from sklearn.feature_extraction.text import TfidfVectorizer

# 로거 설정
logger = logging.getLogger(__name__)

TARGET_COL = "is_attack"
URL_COL = "url"

def train_from_csv(csv_path: Path, model_dir: Path) -> Dict[str, float]:
    try:

        try:
            df = pd.read_csv(csv_path)
        except pd.errors.ParserError as e:
            error_msg = f"CSV 파일 형식이 올바르지 않습니다: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        except Exception as e:
            error_msg = f"CSV 파일을 읽는 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        if len(df) == 0:
            error_msg = "CSV 파일에 데이터가 없습니다."
            logger.error(error_msg)
            raise ValueError(error_msg)

  
        required_cols = [URL_COL, "method", "user_agent", "status_code", TARGET_COL]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            error_msg = f"CSV 파일에 필수 컬럼이 누락되었습니다: {', '.join(missing_cols)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        try:
            df[TARGET_COL] = df[TARGET_COL].astype(bool)

        except Exception as e:
            error_msg = f"'{TARGET_COL}' 컬럼 변환 중 오류: {str(e)}. 불리언 타입(True/False)이어야 합니다."
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.info(f"CSV 데이터 전처리 시작: {len(df)}개 행")
        df[URL_COL] = df[URL_COL].fillna("")
        df["method"] = df["method"].fillna("GET")
        df["user_agent"] = df["user_agent"].fillna("")
        
        try:
            df["status_code"] = pd.to_numeric(df["status_code"], errors="coerce").fillna(200).astype(int)

        except Exception as e:
            error_msg = f"'status_code' 컬럼 변환 중 오류: {str(e)}. 숫자 형식이어야 합니다."
            logger.error(error_msg)
            raise ValueError(error_msg)

        try:
            text_series = df[URL_COL]
            vectorizer = TfidfVectorizer(max_features=5000)
            X_text = vectorizer.fit_transform(text_series)

        except Exception as e:
            error_msg = f"텍스트 벡터화 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # 인코더 생성 및 적용
        try:
            method_enc = SafeEncoder(df["method"].unique().tolist())
            agent_enc = SafeEncoder(df["user_agent"].unique().tolist())

            X_other = df[["status_code"]].copy()
            X_other["method_enc"] = df["method"].apply(method_enc.transform)
            X_other["agent_enc"] = df["user_agent"].apply(agent_enc.transform)


        except Exception as e:
            error_msg = f"카테고리 데이터 인코딩 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

 
        try:
            X_all = pd.concat([pd.DataFrame(X_text.toarray()), X_other], axis=1)
            y = df[TARGET_COL].astype(int)


        except Exception as e:
            error_msg = f"학습 데이터 준비 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # 모델 학습
        try:

            model = XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                objective="binary:logistic",
                n_jobs=-1,
            )
            model.fit(X_all, y)

        except Exception as e:
            error_msg = f"모델 학습 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # 모델 저장
        try:
            model_version = SAVE_MODEL_VERSION
            
            joblib.dump(model, model_dir / f"xgboost_nginx_model_v{model_version}.pkl")
            joblib.dump(vectorizer, model_dir / f"tfidf_vectorizer_v{model_version}.pkl")
            joblib.dump(method_enc, model_dir / f"method_encoder_v{model_version}.pkl")
            joblib.dump(agent_enc, model_dir / f"agent_encoder_v{model_version}.pkl")
            
            logger.info(f"모델 저장 완료: {model_dir}")
        except Exception as e:
            error_msg = f"모델 저장 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        # 평가
        try:
            pred = model.predict(X_all)
            acc = float((pred == y).mean())
            logger.info(f"모델 평가 완료: 정확도 = {acc:.4f}")
            return {"accuracy": acc}
        
        except Exception as e:
            error_msg = f"모델 평가 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
    except ValueError as e:

        logger.error(f"데이터 검증 오류: {str(e)}")
        raise

    except Exception as e:

        error_msg = f"모델 학습 중 예기치 않은 오류가 발생했습니다: {str(e)}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)