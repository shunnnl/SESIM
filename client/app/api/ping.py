# 파일 예시: app/api/ping.py

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.database import get_db  # DB 세션 가져오는 함수

router = APIRouter()

@router.get("/ping")
def ping(db: Session = Depends(get_db)):
    # 실제로 DB 세션이 열리는지 테스트 API
    try:
        db.execute(text("SELECT 1"))  # 간단한 쿼리 날려서 DB 정상 확인
        return {"message": "pong!"}
    except Exception as e:
        return {"error": str(e)}
