import requests
from app.core.config import settings
from app.db.database import engine
from fastapi import APIRouter, HTTPException
from sqlalchemy import Table, Column, MetaData
from sqlalchemy.dialects.postgresql import VARCHAR, BOOLEAN, FLOAT, TIMESTAMP

router = APIRouter()
metadata = MetaData()

TYPE_MAP = {
    "String(15)": VARCHAR(15),
    "String(255)": VARCHAR(255),
    "Boolean": BOOLEAN,
    "Float": FLOAT,
    "DateTime": TIMESTAMP
}


@router.post("/admin/model/{model_id}/table")
def create_result_table(model_id: int):
    # 1. AI 서버에서 스키마 요청
    try:
        resp = requests.get(f"{settings.AI_SERVER_URL}/result/schema")
        schema = resp.json()
    except Exception:
        raise HTTPException(status_code=500, detail="AI 서버로부터 스키마를 불러오지 못했습니다")

    # 2. 동적 테이블 생성
    table_name = f"ai_results_{model_id}"
    columns = [
        Column("id", VARCHAR(36), primary_key=True)  # 기본 id 컬럼
    ]
    for field in schema["fields"]:
        name = field["name"]
        col_type = TYPE_MAP.get(field["type"])
        if not col_type:
            raise HTTPException(status_code=400, detail=f"알 수 없는 컬럼 타입: {field['type']}")
        columns.append(Column(name, col_type))

    table = Table(table_name, metadata, *columns)
    table.create(bind=engine, checkfirst=True)

    return {"message": f"{table_name} 테이블이 성공적으로 생성되었습니다."}
