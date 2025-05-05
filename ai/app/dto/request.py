from typing import List
from typing import Optional
from pydantic import BaseModel

class RawLog(BaseModel):
    client_ip: str
    method: str
    url: str
    status_code: int
    user_agent: str
    referrer: Optional[str] = None
    logged_at: str

class PredictRequest(BaseModel):
    logs: List[RawLog]