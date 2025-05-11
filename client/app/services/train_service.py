import os

from app.core.config import settings
from app.dependencies.auth import verify_api_key
from app.models.models import AITrain, Model
from app.schemas.common import MessageResponse
from app.services.clients.ai_client import send_train_file
from fastapi import HTTPException
from sqlalchemy import select, desc
from sqlalchemy.orm import Session


def handle_training(model_id: int, ai_train_id: int | None, api_key: str, db: Session) -> MessageResponse:
    # 1. API 키 검증
    verify_api_key(model_id, api_key)

    # 2. 학습 파일 선택
    if ai_train_id is not None:
        train_data = db.execute(
            select(AITrain).where(AITrain.ai_train_id == ai_train_id)
        ).scalar_one_or_none()
    else:
        train_data = db.execute(
            select(AITrain)
            .where(AITrain.model_id == model_id)
            .order_by(desc(AITrain.created_at))
            .limit(1)
        ).scalars().first()

    if not train_data:
        raise HTTPException(status_code=404, detail="학습 데이터가 존재하지 않습니다.")

    file_path = train_data.path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail=f"파일 경로가 존재하지 않습니다: {file_path}")

    # 3. 모델 확인
    model = db.query(Model).filter(Model.model_id == train_data.model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="모델이 존재하지 않습니다.")

    # 4. AI 서버 URL 생성
    ai_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}"

    # 5. 학습 요청
    response_json = send_train_file(ai_url, file_path)

    return MessageResponse(
        message="AI 서버에 학습 요청이 완료되었습니다.",
        response=response_json
    )
