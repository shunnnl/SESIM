import threading
import time
from datetime import datetime
from uuid import uuid4

from app.core.config import settings
from app.core.extractors.nginx_extractor import parse_log_lines
from app.db.database import SessionLocal
from app.models.dynamic_ai_results import get_ai_result_table
from app.models.models import AIResultFailure
from app.services.clients.ai_client import send_to_ai_model
from sqlalchemy import insert


def retry_failed_chunks(db):
    failures = db.query(AIResultFailure).filter(AIResultFailure.retry_count < 3).all()

    for failure in failures:
        try:
            model_id = failure.model_id
            file_path = failure.file_path

            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            parsed_logs = parse_log_lines(lines)
            if not parsed_logs:
                raise ValueError("파싱 실패")

            ai_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}"
            results = send_to_ai_model(ai_url, parsed_logs)

            table = get_ai_result_table(model_id)
            insert_data = []
            for log, result in zip(parsed_logs, results["results"]):
                insert_data.append({
                    "ai_result_id": str(uuid4()),
                    "logged_at": datetime.strptime(log["logged_at"], "%d/%b/%Y:%H:%M:%S %z"),
                    "client_ip": log["client_ip"],
                    "method": log["method"],
                    "url": log["url"],
                    "status_code": int(log["status_code"]),
                    "is_attack": result["is_attack"],
                    "attack_score": result["attack_score"]
                })

            db.execute(insert(table), insert_data)
            db.delete(failure)  # 성공 시 제거
            db.commit()
            print(f"✅ 재처리 성공: {file_path}", flush=True)

        except Exception as e:
            failure.retry_count += 1
            failure.error_message = f"{str(e)} | RETRY_COUNT={failure.retry_count}"
            db.commit()
            print(f"❌ 재처리 실패: {file_path} → {str(e)}", flush=True)


def start_retry_scheduler(interval_seconds=3600):
    def run():
        while True:
            print("⏳ [재처리 스케줄러] 시작", flush=True)
            try:
                db = SessionLocal()
                retry_failed_chunks(db)
                db.close()
            except Exception as e:
                print(f"❌ [재처리 스케줄러] 오류 발생: {e}", flush=True)
            time.sleep(interval_seconds)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
