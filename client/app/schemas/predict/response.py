from typing import List

from pydantic import BaseModel


class PredictResponseDTO(BaseModel):
    is_attack: bool  # 공격 여부
    attack_score: float  # 공격 확률


class PredictResponse(BaseModel):
    results: List[PredictResponseDTO]
