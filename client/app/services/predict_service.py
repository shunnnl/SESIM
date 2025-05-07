from datetime import datetime

from app.core.config import settings
from app.core.extractors.nginx_extractor import parse_log_lines
from app.dependencies.auth import verify_api_key
from app.models.dynamic_ai_results import get_ai_result_table
from app.models.models import Model
from app.schemas.predict.request import PredictRequest
from app.schemas.predict.response import PredictResponse, PredictResponseDTO
from app.services.clients.ai_client import send_to_ai_model
from fastapi import HTTPException
from sqlalchemy import insert
from sqlalchemy.orm import Session


def handle_prediction(request: PredictRequest, db: Session, api_key: str) -> PredictResponse:
    verify_api_key(request.model_id, api_key)

    parsed_logs = parse_log_lines(request.logs)
    if not parsed_logs:
        raise HTTPException(status_code=400, detail="로그 파싱 실패")

    # 2. 모델 확인
    model = db.query(Model).filter(Model.model_id == request.model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="해당 모델 없음")

    # 3. AI 서버 요청
    ai_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}"
    results = send_to_ai_model(ai_url, parsed_logs)

    # 4. 테이블 조회 및 결과 저장
    try:
        table = get_ai_result_table(request.model_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"동적 테이블 로딩 실패: {str(e)}")

    insert_data = [
        {
            "logged_at": datetime.strptime(log["logged_at"], "%d/%b/%Y:%H:%M:%S %z"),
            "client_ip": log["client_ip"],
            "method": log["method"],
            "url": log["url"],
            "status_code": int(log["status_code"]),
            "is_attack": result["is_attack"],
            "attack_score": result["attack_score"]
        }
        for log, result in zip(parsed_logs, results["results"])
    ]

    db.execute(insert(table), insert_data)
    db.commit()

    return PredictResponse(results=[PredictResponseDTO(**r) for r in results["results"]])
