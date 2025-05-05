from typing import List
from fastapi import APIRouter
from app.utils import preprocess_url
from app.core.registry import load_bundle
from app.dto.response import PredictResponse
from app.core.config import DEFAULT_MODEL_ID
from app.services.predictor import predict_logs
from app.dto.request import PredictRequest, RawLog

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
def predict_endpoint(req: PredictRequest):

    model_id = DEFAULT_MODEL_ID
    model, vectorizer, method_encoder, agent_encoder = load_bundle(model_id)

    processed_logs: List[RawLog] = []
    for log in req.logs:
        log_copy = log.copy()
        log_copy.url = preprocess_url(log.url)
        processed_logs.append(log_copy)

    results = predict_logs(model, vectorizer, processed_logs, method_encoder, agent_encoder)

    return PredictResponse(results=results)