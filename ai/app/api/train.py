from pathlib import Path
from app.dto.response import TrainResponse
from app.services.trainer import train_from_csv
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.core.config import MODEL_DIR
from app.core.registry import get_next_model_version, clear_bundle_cache

router = APIRouter(tags=["학습 api"])

@router.post("/train", response_model=TrainResponse)
async def train_endpoint(
    csv_file: UploadFile = File(...)
):
    if not csv_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 가능합니다.")

    next_version = get_next_model_version()
    
    dest_dir = MODEL_DIR / f"model_v{next_version}"
    dest_dir.mkdir(parents=True, exist_ok=True)

    tmp_path = dest_dir / f"raw_{csv_file.filename}"

    try:
        with tmp_path.open("wb") as f:
            f.write(await csv_file.read())

        result = train_from_csv(tmp_path, dest_dir, model_version=next_version)
        
        clear_bundle_cache()

        return TrainResponse(message=f"모델 학습 완료 (버전: {next_version})", version=next_version)
    
    finally:
        tmp_path.unlink(missing_ok=True)