import os
from datetime import datetime

from app.core.config import settings
from app.core.extractors.nginx_extractor import parse_log_lines
from app.dependencies.auth import verify_api_key
from app.models.dynamic_ai_results import get_ai_result_table
from app.models.models import Model, AIResultFailure
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
            print(f"chunk {i} 파싱 실패 또는 유효한 로그 없음", flush=True)
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


def handle_prediction_from_file_async(
        model_id: int,
        original_filename: str,
        file_path: str,
        db: Session,
        api_key: str
):
    try:
        verify_api_key(model_id, api_key)

        model = db.query(Model).filter(Model.model_id == model_id).first()
        if not model:
            raise ValueError(f"Model ID {model_id} not found")

        original_filename_wo_ext = os.path.splitext(original_filename)[0]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # 1. 파일 읽기
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        # 2. 결과 테이블 로딩
        table = get_ai_result_table(model_id)

        # 3. chunk별 처리
        CHUNK_SIZE = 100
        model_dir = os.path.join("/mnt/data/failed_chunks", f"model_{model_id}")
        os.makedirs(model_dir, exist_ok=True)

        for i in range(0, len(lines), CHUNK_SIZE):
            chunk = lines[i:i + CHUNK_SIZE]
            parsed_logs = parse_log_lines(chunk)

            if not parsed_logs:
                print(f"chunk {i} 파싱 실패 또는 유효한 로그 없음", flush=True)
                continue

            try:
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

            except Exception as e:
                chunk_filename = f"{original_filename_wo_ext}_{model_id}_{timestamp}_chunk_{i}.log"
                fail_path = os.path.join(model_dir, chunk_filename)
                with open(fail_path, "w", encoding="utf-8") as f:
                    f.writelines(chunk)

                db.execute(
                    insert(AIResultFailure).values(
                        model_id=model_id,
                        file_path=fail_path,
                        error_message=f"{str(e)} | source_file={original_filename} | chunk_index={i}",
                        created_at=datetime.now()
                    )
                )
                db.commit()
                print(f"chunk {i} 실패 → {fail_path} 에 저장 및 기록 완료", flush=True)

        print(f"전체 {len(lines)}줄 처리 완료", flush=True)

    except Exception as e:
        print(f"전체 예측 처리 실패: {str(e)}", flush=True)


def save_uploaded_file(model_id: int, file: UploadFile) -> tuple[str, str]:
    """
    업로드된 파일을 저장하고 (경로, 원본 파일명) 반환
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    original_filename = file.filename
    file_path = os.path.join(UPLOAD_DIR, f"{model_id}_{timestamp}_{original_filename}")

    with open(file_path, "wb") as out_file:
        out_file.write(file.file.read())

    return file_path, original_filename
