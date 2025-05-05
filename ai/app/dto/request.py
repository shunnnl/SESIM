from pydantic import BaseModel
from typing import List

class RawLog(BaseModel):
    client_ip: str
    method: str
    url: str
    status_code: int
    user_agent: str
    referrer: str = None
    logged_at: str

class PredictRequest(BaseModel):
    logs: List[RawLog]