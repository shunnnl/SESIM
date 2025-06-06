from pydantic import BaseModel
from typing import List

class PredictRequest(BaseModel):
    model_id: int
    logs: List[str]  # Nginx 로그 라인들
