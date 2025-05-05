from typing import Optional
from app.dto.response import SchemaResponse
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import Table, Column, Integer, String, Boolean, Float, DateTime, MetaData, CHAR

router = APIRouter(tags=["schema"])

def create_ai_result_table():
    """
    AI 예측 결과 테이블 구조를 반환합니다.
    이 테이블은 DB에 직접 생성되지는 않고, /schema API 응답 용도로 사용됩니다.
    """

    metadata = MetaData()
    
    table_name = "ai_results"
    return Table(
        table_name,
        metadata,
        Column("ai_result_id", String(255), primary_key=True),
        Column("logged_at", DateTime, nullable=False),
        Column("client_ip", String(15), nullable=False),
        Column("method", String(10)),
        Column("url", String(2000)),
        Column("status_code", CHAR(3)),
        Column("is_attack", Boolean, nullable=False),
        Column("attack_score", Float),
        Column("attack_type", String(50))
    )

@router.get("/schema", response_model=SchemaResponse)
async def schema_endpoint():
    try:
        table = create_ai_result_table()
        columns = {col.name: str(col.type) for col in table.columns}
        
        return SchemaResponse(
            table_name=table.name,
            columns=columns
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"스키마를 찾을 수 없습니다: {str(e)}")