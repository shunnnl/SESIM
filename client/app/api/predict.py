from datetime import datetime
from uuid import uuid4

from app.core.config import settings
from app.core.extractors.nginx_extractor import parse_log_lines
from app.db.database import SessionLocal
from app.dependencies.auth import verify_api_key
from app.models.dynamic_ai_results import get_ai_result_table  # ✅ 테이블 불러오기 전용 함수로 변경
from app.schemas.predict.request import PredictRequest
from app.schemas.predict.response import PredictResponse
from app.services.predict_client import send_to_ai_model
from fastapi import APIRouter, HTTPException, Header
from sqlalchemy import insert

router = APIRouter()


@router.post("/v1/predict", response_model=PredictResponse)
def predict(
        request: PredictRequest,
        api_key: str = Header(..., alias="api-key")
):
    verify_api_key(model_id=request.model_id, api_key=api_key)

    db = SessionLocal()
    try:
        # 1. 로그 전처리
        parsed_logs = parse_log_lines(request.logs)
        if not parsed_logs:
            raise HTTPException(status_code=400, detail="로그 파싱 실패")

        # 2. 모델 존재 여부 확인
        from app.models.models import Model
        model = db.query(Model).filter(Model.model_id == request.model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="해당 모델 없음")

        # 3. AI 서버로 예측 요청
        ai_url = f"{settings.AI_SERVER_BASE_URL}{request.model_id}:{settings.AI_SERVER_PORT}/v1/predict"
        results = send_to_ai_model(ai_url, parsed_logs)

        # 4. 결과 저장을 위한 테이블 로딩만 수행 (생성은 하지 않음)
        table = get_ai_result_table(request.model_id)

        # 5. 결과 DB 저장
        insert_data = []
        for log, result in zip(parsed_logs, results["results"]):
            insert_data.append({
                "ai_result_id": str(uuid4()),
                "logged_at": datetime.strptime(log["time"], "%d/%b/%Y:%H:%M:%S %z"),
                "client_ip_v4": log["ip"],
                "method": log["method"],
                "url_path": log["url"],
                "status_code": int(log["status_code"]),
                "is_attack": result["is_attack"],
                "attack_score": result["attack_score"]
            })

        db.execute(insert(table), insert_data)
        db.commit()

        return {"results": results["results"]}
    finally:
        db.close()
