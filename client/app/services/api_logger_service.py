import time
from datetime import datetime

from app.models.models import APILog
from sqlalchemy.orm import Session


def log_api_call(db: Session, model_id: int, api_path: str, start_time: float):
    try:
        latency_ms = int((time.time() - start_time) * 1000)
        log = APILog(
            model_id=model_id,
            name=api_path,
            latency_ms=latency_ms,
            usage_date=datetime.now(),
            created_at=datetime.now()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"API 로그 기록 실패: {e}", flush=True)
