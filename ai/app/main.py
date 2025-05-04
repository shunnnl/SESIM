from fastapi import FastAPI
from app.api import predict, train, schema

app = FastAPI(title="보안 AI 시스템", version="1.0.0")

app.include_router(predict.router, prefix="/api")
app.include_router(train.router, prefix="/api")
app.include_router(schema.router, prefix="/api")
