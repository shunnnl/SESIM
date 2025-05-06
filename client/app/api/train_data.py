import os
from datetime import datetime
from uuid import uuid4

from app.db.database import SessionLocal
from app.dependencies.auth import verify_api_key
from app.models.models import AITrain
from fastapi import APIRouter, File, UploadFile, Form, Header
from sqlalchemy import select

router = APIRouter()

BASE_TRAIN_DIR = "/mnt/data/train_data"


@router.post("/admin/train/upload")
def upload_train_data(
        model_id: int = Form(...),
        file: UploadFile = File(...),
        api_key: str = Header(..., alias="api-key")
):
    verify_api_key(model_id=model_id, api_key=api_key)

    # 디렉토리 생성
    model_dir = os.path.join(BASE_TRAIN_DIR, f"model_{model_id}")
    os.makedirs(model_dir, exist_ok=True)

    # 파일 저장
    basename, extension = os.path.splitext(file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{basename}_{uuid4().hex}{extension}"
    file_path = os.path.join(model_dir, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # DB 저장
    db = SessionLocal()
    try:
        train_entry = AITrain(
            model_id=model_id,
            path=file_path,
            created_at=datetime.now()
        )
        db.add(train_entry)
        db.commit()
    finally:
        db.close()

    return {"message": "학습 데이터가 성공적으로 업로드되었습니다.", "path": file_path}


@router.get("/admin/train/{model_id}")
def get_uploaded_train_files(model_id: int):
    db = SessionLocal()
    try:
        result = db.execute(
            select(AITrain.ai_train_id, AITrain.path, AITrain.created_at)
            .where(AITrain.model_id == model_id)
            .order_by(AITrain.created_at.desc())
        ).fetchall()

        return [
            {
                "ai_train_id": row[0],
                "path": row[1],
                "created_at": row[2].isoformat()
            }
            for row in result
        ]
    finally:
        db.close()
