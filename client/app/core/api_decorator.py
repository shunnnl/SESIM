import time
from functools import wraps

from app.services.api_logger_service import log_api_call
from sqlalchemy.orm import Session


def api_logger(api_path: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            db: Session = kwargs.get("db")
            model_id: int = kwargs.get("model_id")
            start = time.time()

            response = func(*args, **kwargs)

            if db and model_id:
                log_api_call(db, model_id, api_path, start)

            return response

        return wrapper

    return decorator
