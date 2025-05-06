import os

import requests
from app.core.config import settings
from app.db.database import SessionLocal
from app.dependencies.auth import verify_api_key
from app.models.models import AITrain, Model
from fastapi import APIRouter, HTTPException, Header
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/admin/train/{model_id}")
def train_model(model_id: int,
                api_key: str = Header(..., alias="api-key")):
    verify_api_key(model_id=model_id, api_key=api_key)

    db: Session = SessionLocal()
    try:
        # 1. 학습 파일 조회
        train_data = db.query(AITrain).filter(AITrain.ai_train_id == ai_train_id).first()
        if not train_data:
            raise HTTPException(status_code=404, detail="학습 데이터가 존재하지 않습니다.")

        file_path = train_data.path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=400, detail="학습 파일 경로가 존재하지 않습니다.")

        # 2. 모델 정보 조회
        model = db.query(Model).filter(Model.model_id == train_data.model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="모델이 존재하지 않습니다.")

        # 3. AI 서버 주소 구성 (model_id를 호스트명에 포함)
        ai_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}/api/train"
        # ai_url = f"http://ai-server:{settings.AI_SERVER_PORT}/api/train"

        # 4. 학습 요청 전송
        with open(file_path, "rb") as f:
            files = {'file': (os.path.basename(file_path), f)}
            response = requests.post(ai_url, files=files)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"AI 서버 학습 요청 실패: {response.text}")

        return {"message": "AI 서버에 학습 요청이 완료되었습니다.", "response": response.json()}
    finally:
        db.close()
