from app.db.database import get_db
from app.schemas.common import MessageResponse
from app.services.upload_service import handle_upload_train_data, get_uploaded_train_files
from fastapi import APIRouter, UploadFile, File, Form, Header, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/admin/train/file/upload", response_model=MessageResponse)
def upload_train_data_api(
        model_id: int = Form(...),
        file: UploadFile = File(...),
        api_key: str = Header(..., alias="api-key"),
        db: Session = Depends(get_db)
):
    return handle_upload_train_data(model_id, file, api_key, db)


@router.get("/admin/train/{model_id}", response_model=list[MessageResponse])
def get_uploaded_train_files_api(
        model_id: int,
        db: Session = Depends(get_db)
):
    return get_uploaded_train_files(model_id, db)
