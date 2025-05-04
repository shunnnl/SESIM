from pydantic import BaseModel
from typing import List
from datetime import datetime

class PredictResponseDTO(BaseModel):
    timestamp: datetime       # 로그 발생 시간
    ip: str                   # 클라이언트 IP
    method: str               # HTTP 요청 방식
    path: str                 # 요청 URL 경로
    status_code: int          # 응답 코드
    is_attack: bool           # 공격 여부
    attack_score: float       # 공격 확률

class PredictResponse(BaseModel):
    results: List[PredictResponseDTO]
