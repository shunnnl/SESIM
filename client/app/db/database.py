import os

from app.models.models import Base
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

# 환경 변수로부터 가져오기
DB_URL = os.getenv("DB_URL")

if not DB_URL:
    raise ValueError("❌ DATABASE_URL (DB_URL) 환경변수가 설정되지 않았습니다.")

# 엔진 생성
engine = create_engine(
    DB_URL,
    pool_pre_ping=True,
)

# 세션 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    요청마다 독립적인 DB 세션을 생성해서 반환하는 의존성 함수
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    서버 시작할 때 고정 테이블 + dynamic ai_results 테이블 생성
    """
    # 고정 테이블 생성
    Base.metadata.create_all(bind=engine)


def create_dynamic_ai_result_tables():
    """
    models 테이블에 등록된 모든 모델에 대해
    AI 서버에 스키마 요청 → 동적 테이블 생성
    """
    from app.models.models import Model
    from app.api.model_table import create_result_table_for_model

    db = SessionLocal()
    try:
        model_ids = db.query(Model.model_id).all()
        for (model_id,) in model_ids:
            try:
                create_result_table_for_model(model_id)
                print(f"✅ ai_results_{model_id} 테이블 생성 완료")
            except Exception as e:
                print(f"❌ 테이블 생성 실패 (model_id={model_id}): {e}")
    finally:
        db.close()


def execute_sql_file(path: str):
    with engine.connect() as connection:
        with open(path, "r") as file:
            sql = file.read()
        for stmt in sql.split(";"):
            stmt = stmt.strip()
            if stmt:
                connection.execute(text(stmt))
        connection.commit()
    print("[✅ INIT] init.sql 실행 완료")
