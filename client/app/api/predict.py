from app.db.database import get_db
from app.schemas.common import MessageResponse
from app.schemas.predict.request import PredictRequest
from app.schemas.predict.response import PredictResponse
from app.services.predict_service import handle_prediction, save_uploaded_file, handle_prediction_from_file_async
from fastapi import APIRouter, Depends, Header, UploadFile, File, Form
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/v1/predict", response_model=PredictResponse)
def predict_api(
        request: PredictRequest,
        api_key: str = Header(..., alias="api-key"),
        db: Session = Depends(get_db),
):
    return handle_prediction(request, db, api_key)


# 동기 버전
# @router.post("/v1/predict/file", response_model=MessageResponse)
# def predict_file_api(
#     model_id: int = Form(...),
#     file: UploadFile = File(...),
#     api_key: str = Header(..., alias="api-key"),
#     db: Session = Depends(get_db)
# ):
#     handle_prediction_from_file(model_id, file, db, api_key)
#     return {"message": "파일 예측 처리가 완료되었습니다."}


# 비동기 버전
@router.post("/v1/predict/file", response_model=MessageResponse)
def predict_file_api(
        background_tasks: BackgroundTasks,
        model_id: int = Form(...),
        file: UploadFile = File(...),
        api_key: str = Header(..., alias="api-key"),
        db: Session = Depends(get_db)
):
    # 1. 파일 저장
    file_path, original_filename = save_uploaded_file(model_id, file)

    # 2. 비동기 처리 등록
    background_tasks.add_task(
        handle_prediction_from_file_async,
        model_id, original_filename, file_path, db, api_key
    )

    return {"message": "비동기 파일 예측 처리가 시작되었습니다."}
