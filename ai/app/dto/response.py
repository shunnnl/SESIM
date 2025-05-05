from pydantic import BaseModel, Field
from typing import List, Dict

class PredictResult(BaseModel):
    is_attack: bool = Field(..., description="공격 여부")
    attack_score: float = Field(..., description="공격일 확률 (0.0 ~ 1.0)")

class PredictResponse(BaseModel):
    results: List[PredictResult]


class TrainResponse(BaseModel):
    message: str = "모델 학습 완료"


class SchemaResponse(BaseModel):
    table_name: str
    columns: Dict[str, str]