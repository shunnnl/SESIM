# app/api/predict.py
from fastapi import APIRouter
from app.dto.request  import PredictRequest
from app.dto.response import PredictResponse
from app.services.predictor import predict_logs

router = APIRouter(tags=["공격 추론 api"])

@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):
    return PredictResponse(results=predict_logs(req.logs))