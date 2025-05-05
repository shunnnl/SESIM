from typing import List
from fastapi import APIRouter
from app.utils import preprocess_url
from app.core.registry import load_bundle
from app.dto.response import PredictResponse
from app.services.predictor import predict_logs
from app.dto.request import PredictRequest, RawLog

router = APIRouter(tags=["공격 판별 api"])

@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):
    model, vectorizer, method_encoder, agent_encoder = load_bundle()

    processed_logs: List[RawLog] = []
    for log in req.logs:
        log_copy = log.copy()
        log_copy.url = preprocess_url(log.url)
        processed_logs.append(log_copy)

    results = predict_logs(model, vectorizer, processed_logs, method_encoder, agent_encoder)

    return PredictResponse(results=results)