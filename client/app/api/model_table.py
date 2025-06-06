from app.db.database import get_db
from app.schemas.common import MessageResponse
from app.services.model_table_service import handle_create_result_table
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/admin/model/{model_id}/table", response_model=MessageResponse)
def create_result_table_api(
        model_id: int,
        db: Session = Depends(get_db)
):
    return handle_create_result_table(model_id, db)
