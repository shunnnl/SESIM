# app/dependencies/auth.py

from app.db.database import SessionLocal
from app.models.models import Model
from fastapi import HTTPException


def verify_api_key(model_id: int, api_key: str):
    db = SessionLocal()
    try:
        model = db.query(Model).filter(Model.model_id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="해당 모델 없음")
        if model.api_key != api_key:
            raise HTTPException(status_code=401, detail="API Key가 일치하지 않습니다.")
    finally:
        db.close()
