from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from api import train, predict, upload

app = FastAPI(
    title="Sesiem",
    description="Client Sesiem Server",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 시 제한 필요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
# app.include_router(upload.router, prefix="/admin", tags=["Upload"])
# app.include_router(train.router, prefix="/admin", tags=["Train"])
# app.include_router(predict.router, prefix="/v1", tags=["Predict"])

@app.get("/")
def hello() :
	return "Hello, World!"

