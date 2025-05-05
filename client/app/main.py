from contextlib import asynccontextmanager

from app.api import predict
from app.api import train_data
from app.db.database import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # 서버 시작할 때 DB 테이블 생성
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

# API 라우터 등록
app.include_router(predict.router)
app.include_router(train_data.router, prefix="/admin", tags=["Train Data"])
