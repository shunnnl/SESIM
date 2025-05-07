import os
from datetime import datetime
from uuid import uuid4

from app.dependencies.auth import verify_api_key
from app.models.models import AITrain
from app.schemas.common import MessageResponse
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

BASE_TRAIN_DIR = "/mnt/data/train_data"


def handle_upload_train_data(model_id: int, file: UploadFile, api_key: str, db: Session) -> MessageResponse:
    verify_api_key(model_id, api_key)

    # 디렉토리 생성
    model_dir = os.path.join(BASE_TRAIN_DIR, f"model_{model_id}")
    os.makedirs(model_dir, exist_ok=True)

    # 파일 저장
    basename, extension = os.path.splitext(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{basename}_{uuid4().hex}{extension}"
    file_path = os.path.join(model_dir, filename)

    try:
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {str(e)}")

    # DB 저장
    train_entry = AITrain(
        model_id=model_id,
        path=file_path,
        created_at=datetime.now()
    )
    db.add(train_entry)
    db.commit()

    return MessageResponse(message="학습 데이터 업로드 성공", response={"path": file_path})


def get_uploaded_train_files(model_id: int, db: Session) -> list[MessageResponse]:
    results = (
        db.query(AITrain)
        .filter(AITrain.model_id == model_id)
        .order_by(AITrain.created_at.desc())
        .all()
    )

    return [
        MessageResponse(
            message="업로드 기록",
            response={
                "ai_train_id": r.ai_train_id,
                "path": r.path,
                "created_at": r.created_at.isoformat()
            }
        )
        for r in results
    ]
