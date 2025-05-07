from app.db.database import get_db
from app.schemas.predict.request import PredictRequest
from app.schemas.predict.response import PredictResponse
from app.services.predict_service import handle_prediction
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/v1/predict", response_model=PredictResponse)
def predict_api(
        request: PredictRequest,
        api_key: str = Header(..., alias="api-key"),
        db: Session = Depends(get_db),
):
    return handle_prediction(request, db, api_key)
