import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, Model
from app.models.dynamic_ai_results import create_ai_result_table

# 환경 변수로부터 가져오기
DATABASE_URL = os.getenv("DB_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL (DB_URL) 환경변수가 설정되지 않았습니다.")

# 엔진 생성
engine = create_engine(
    DATABASE_URL,
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

    # dynamic ai_results 테이블 생성
    create_dynamic_ai_result_tables()

def create_dynamic_ai_result_tables():
    """
    models 테이블에 등록된 모든 모델 id를 가져와서
    ai_results_<model_id> 테이블을 동적으로 생성
    """
    from sqlalchemy.orm import Session

    session = Session(bind=engine)
    metadata = MetaData()

    try:
        model_ids = session.query(Model.model_id).all()

        for (model_id,) in model_ids:
            dynamic_table = create_ai_result_table(model_id)
            dynamic_table.metadata.create_all(bind=engine)

        print(f"✅ dynamic ai_results_N 테이블 {len(model_ids)}개 생성 완료")
    finally:
        session.close()
