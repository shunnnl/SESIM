from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
from app.api.ping import router as ping_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # 서버 시작할 때 DB 테이블 생성
    yield


app = FastAPI(
    title="Sesim",
    description="Client Sesim Server",
    version="1.0.0",
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
app.include_router(ping_router)

@app.get("/")
def hello():
    return "Hello, World!"
