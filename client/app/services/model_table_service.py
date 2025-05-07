from app.core.config import settings
from app.db.database import engine
from app.models.models import Model
from app.schemas.common import MessageResponse
from app.services.clients.ai_client import get_model_schema
from fastapi import HTTPException
from sqlalchemy import Table, Column, MetaData, Integer
from sqlalchemy.dialects.postgresql import VARCHAR, BOOLEAN, FLOAT, TIMESTAMP, CHAR, INTEGER
from sqlalchemy.orm import Session

metadata = MetaData()


def _parse_type(type_str: str):
    if type_str.startswith("VARCHAR("):
        return VARCHAR(int(type_str[8:-1]))
    elif type_str.startswith("CHAR("):
        return CHAR(int(type_str[5:-1]))
    elif type_str.upper() in {"BOOLEAN", "FLOAT", "DATETIME", "INTEGER"}:
        return {
            "BOOLEAN": BOOLEAN,
            "FLOAT": FLOAT,
            "DATETIME": TIMESTAMP,
            "INTEGER": INTEGER
        }[type_str.upper()]
    else:
        return None


def handle_create_result_table(model_id: int, db: Session) -> MessageResponse:
    # 모델 확인
    model = db.query(Model).filter(Model.model_id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="모델이 존재하지 않습니다.")

    # AI URL 구성
    model_url = f"{settings.AI_SERVER_BASE_URL}{model.model_id}:{settings.AI_SERVER_PORT}"

    # 스키마 요청
    schema = get_model_schema(model_url)

    # 테이블 생성
    table_name = f"ai_results_{model_id}"
    columns = [Column("ai_result_id", Integer, primary_key=True, autoincrement=True)]

    for name, col_type_str in schema["columns"].items():
        col_type = _parse_type(col_type_str)
        if not col_type:
            raise HTTPException(status_code=400, detail=f"알 수 없는 컬럼 타입: {col_type_str}")
        columns.append(Column(name, col_type))

    table = Table(table_name, metadata, *columns)
    table.create(bind=engine, checkfirst=True)

    return MessageResponse(message=f"{table_name} 테이블이 성공적으로 생성되었습니다.")
