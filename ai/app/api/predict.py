# app/api/predict.py
from fastapi import APIRouter
from app.dto.request  import PredictRequest
from app.dto.response import PredictResponse
from app.services.predictor import predict_logs

router = APIRouter(tags=["공격 판별 api"])

@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):
    """
    요청 로그 배열 → Stage-1/Stage-2 모델을 거쳐 결과 반환
    """
    return PredictResponse(results=predict_logs(req.logs))
