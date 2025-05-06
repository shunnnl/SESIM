from datetime import datetime

from app.core.config import settings
from app.core.extractors.nginx_extractor import parse_log_lines
from app.db.database import SessionLocal
from app.dependencies.auth import verify_api_key
from app.models.dynamic_ai_results import get_ai_result_table
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

        # 3. AI 서버 URL 구성
        ai_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}"
        # ai_url = f"http://ai-server:{settings.AI_SERVER_PORT}"

        # 4. AI 서버 예측 요청
        results = send_to_ai_model(ai_url, parsed_logs)

        # 5. 동적 테이블 로드 (미리 생성되어 있어야 함)
        try:
            table = get_ai_result_table(request.model_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"동적 테이블 로딩 실패: {str(e)}")

        # 6. 결과 저장
        insert_data = []
        for log, result in zip(parsed_logs, results["results"]):
            insert_data.append({
                "logged_at": datetime.strptime(log["logged_at"], "%d/%b/%Y:%H:%M:%S %z"),
                "client_ip": log["client_ip"],
                "method": log["method"],
                "url": log["url"],
                "status_code": int(log["status_code"]),
                "is_attack": result["is_attack"],
                "attack_score": result["attack_score"]
            })

        db.execute(insert(table), insert_data)
        db.commit()

        return {"results": results["results"]}
    finally:
        db.close()
