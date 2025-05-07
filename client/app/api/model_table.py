import requests
from app.core.config import settings
from app.db.database import engine, SessionLocal
from app.models.models import Model
from fastapi import APIRouter, HTTPException
from sqlalchemy import Table, Column, MetaData, Integer
from sqlalchemy.dialects.postgresql import VARCHAR, BOOLEAN, FLOAT, TIMESTAMP, INTEGER, CHAR

router = APIRouter()
metadata = MetaData()


def parse_type(type_str: str):
    if type_str.startswith("VARCHAR("):
        length = int(type_str.replace("VARCHAR(", "").replace(")", ""))
        return VARCHAR(length)
    elif type_str.startswith("CHAR("):
        length = int(type_str.replace("CHAR(", "").replace(")", ""))
        return CHAR(length)
    elif type_str.upper() in {"BOOLEAN", "FLOAT", "DATETIME", "INTEGER"}:
        return {
            "BOOLEAN": BOOLEAN,
            "FLOAT": FLOAT,
            "DATETIME": TIMESTAMP,
            "INTEGER": INTEGER
        }[type_str.upper()]
    else:
        return None


def create_result_table_for_model(model_id: int):
    try:
        # resp = requests.get(f"http://ai-server:8000/api/schema")
        resp = requests.get(f"{settings.AI_SERVER_BASE_URL}{model_id}:{settings.AI_SERVER_PORT}/api/schema")
        schema = resp.json()
    except Exception as e:
        raise Exception(f"[모델 {model_id}] AI 서버 스키마 요청 실패: {str(e)}")

    table_name = f"ai_results_{model_id}"
    columns = [Column("ai_result_id", Integer, primary_key=True, autoincrement=True)]

    for name, col_type_str in schema["columns"].items():
        col_type = parse_type(col_type_str)
        if not col_type:
            raise Exception(f"[모델 {model_id}] 알 수 없는 컬럼 타입: {col_type_str}")
        columns.append(Column(name, col_type))

    table = Table(table_name, metadata, *columns)
    table.create(bind=engine, checkfirst=True)
    print(f"✅ 테이블 생성 완료: {table_name}")


@router.post("/admin/model/{model_id}/table")
def create_result_table_api(model_id: int):
    """
    수동 API: 특정 model_id에 대해 ai_results 테이블 생성
    """
    db = SessionLocal()
    try:
        model = db.query(Model).filter(Model.model_id == model_id).first()
        if not model:
            raise HTTPException(status_code=404, detail="해당 모델이 존재하지 않습니다.")
    finally:
        db.close()

    try:
        create_result_table_for_model(model_id)
        return {"message": f"ai_results_{model_id} 테이블이 성공적으로 생성되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
