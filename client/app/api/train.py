from app.core.api_decorator import api_logger
from app.db.database import get_db
from app.schemas.common import MessageResponse
from app.services.train_service import handle_training
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/admin/train/{model_id}", response_model=MessageResponse)
@api_logger("/admin/train/{model_id}")
def train_model_api(
        model_id: int,
        ai_train_id: int,
        api_key: str = Header(..., alias="api-key"),
        db: Session = Depends(get_db)
):
    return handle_training(model_id, ai_train_id, api_key, db)
