import time

import requests
from app.core.config import settings
from app.db.database import SessionLocal
from app.models.models import APILog, Model
from sqlalchemy import func
from sqlalchemy.orm import Session

API_URL = f"{settings.SAAS_SERVER_BASE_URL}/api/deployment/api-usage"


def send_usage_aggregates():
    db: Session = SessionLocal()

    try:
        # 집계: model_id + name 별로 count, latency 합계
        result = db.query(
            APILog.model_id,
            APILog.name,
            func.count().label("request_count"),
            func.sum(APILog.latency_ms).label("latency_sum")
        ).group_by(APILog.model_id, APILog.name).all()

        for row in result:
            model = db.query(Model).filter(Model.model_id == row.model_id).first()
            if not model:
                continue

            payload = {
                "projectId": model.project_id,
                "modelId": row.model_id,
                "apiName": row.name,
                "totalRequestCount": row.request_count,
                "totalSeconds": row.latency_sum
            }

            requests.post(API_URL, json=payload)

    except Exception as e:
        print(f"집계 전송 실패: {e}")
    finally:
        db.close()


def start_usage_scheduler(interval_sec: int = 10):
    from threading import Thread

    def loop():
        while True:
            send_usage_aggregates()
            time.sleep(interval_sec)

    Thread(target=loop, daemon=True).start()
