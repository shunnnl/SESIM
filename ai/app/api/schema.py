from typing import Optional
from app.dto.response import SchemaResponse
from fastapi import APIRouter, HTTPException
from sqlalchemy import Table, Column, String, Boolean, Float, DateTime, MetaData, CHAR

router = APIRouter(tags=["schema"])

def create_ai_result_table():

    metadata = MetaData()
    
    table_name = "ai_results"
    return Table(
        table_name,
        metadata,
        Column("logged_at", DateTime, nullable=False),
        Column("client_ip", String(15), nullable=False),
        Column("method", String(255)),
        Column("url", String(2000)),
        Column("domain", String(255)),
        Column("path", String(2000)),
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