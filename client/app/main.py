from contextlib import asynccontextmanager

from app.api import model_table
from app.api import predict
from app.api import train
from app.api import upload
from app.core.api_usage_scheduler import start_usage_scheduler
from app.core.retry_scheduler import start_retry_scheduler
from app.db.database import init_db, execute_sql_file, create_dynamic_ai_result_tables
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"❌ init_db() 실패: {e}")

    try:
        execute_sql_file("/init.sql")
    except Exception as e:
        print(f"❌ execute_sql_file 실패: {e}")

    try:
        create_dynamic_ai_result_tables()
    except Exception as e:
        print(f"❌ create_dynamic_ai_result_tables 실패: {e}")

    yield


app = FastAPI(
    title="Sesim",
    description="Client Sesim Server",
    version="1.0.0",
    root_path="/api",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 스케줄러 시작
start_retry_scheduler()
start_usage_scheduler()

# API 라우터 등록
app.include_router(predict.router)
app.include_router(train.router)
app.include_router(model_table.router)
app.include_router(upload.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
