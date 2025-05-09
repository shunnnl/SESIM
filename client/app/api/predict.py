from app.db.database import get_db
from app.schemas.common import MessageResponse
from app.schemas.predict.request import PredictRequest
from app.schemas.predict.response import PredictResponse
from app.services.predict_service import handle_prediction, handle_prediction_from_file
from fastapi import APIRouter, Depends, Header, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/v1/predict", response_model=PredictResponse)
def predict_api(
        request: PredictRequest,
        api_key: str = Header(..., alias="api-key"),
        db: Session = Depends(get_db),
):
    return handle_prediction(request, db, api_key)


@router.post("/v1/predict/file", response_model=MessageResponse)
def predict_file_api(
    model_id: int = Form(...),
    file: UploadFile = File(...),
    api_key: str = Header(..., alias="api-key"),
    db: Session = Depends(get_db)
):
    handle_prediction_from_file(model_id, file, db, api_key)
    return {"message": "파일 예측 처리가 완료되었습니다."}