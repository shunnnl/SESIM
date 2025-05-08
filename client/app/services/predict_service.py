import os
from datetime import datetime

import aiofiles
from app.core.config import settings
from app.core.extractors.nginx_extractor import parse_log_lines
from app.dependencies.auth import verify_api_key
from app.models.dynamic_ai_results import get_ai_result_table
from app.models.models import Model
from app.schemas.predict.request import PredictRequest
from app.schemas.predict.response import PredictResponse, PredictResponseDTO
from app.services.clients.ai_client import send_to_ai_model
from fastapi import HTTPException
from fastapi import UploadFile
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


UPLOAD_DIR = "/mnt/data/input_data"

def handle_prediction_from_file(model_id: int, file: UploadFile, db: Session, api_key: str):
    """
       파일을 저장하고, 줄 단위로 나눠 AI 예측 → DB 저장까지 수행
       """
    verify_api_key(model_id, api_key)

    # 모델 확인
    model = db.query(Model).filter(Model.model_id == model_id).first()
    if not model:
        raise ValueError(f"Model ID {model_id} not found")

    # 테이블 로드
    table = get_ai_result_table(model_id)

    # 파일 저장
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(UPLOAD_DIR, f"{model_id}_{timestamp}_{file.filename}")
    with open(file_path, "wb") as out_file:
        out_file.write(file.file.read())

    # 파일 읽기
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    CHUNK_SIZE = 100
    for i in range(0, len(lines), CHUNK_SIZE):
        chunk = lines[i:i + CHUNK_SIZE]
        parsed_logs = parse_log_lines(chunk)
        if not parsed_logs:
            print(f"⚠️ chunk {i} 파싱 실패 또는 유효한 로그 없음", flush=True)
            continue

        ai_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}"
        results = send_to_ai_model(ai_url, parsed_logs)

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
        print(f"✅ saved chunk {i // CHUNK_SIZE + 1} (lines {i}~{i + len(chunk) - 1})", flush=True)