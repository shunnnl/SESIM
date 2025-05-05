from pathlib import Path
from app.dto.response import TrainResponse
from app.services.trainer import train_from_csv
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.core.config import MODEL_DIR, SAVE_MODEL_VERSION, DEFAULT_MODEL_ID

router = APIRouter(tags=["train"])

@router.post("/train", response_model=TrainResponse)
async def train_endpoint(
    csv_file: UploadFile = File(...)
):
    if not csv_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 가능합니다.")

    model_id = DEFAULT_MODEL_ID
    dest_dir = MODEL_DIR / str(model_id) / f"model_v{SAVE_MODEL_VERSION}"
    dest_dir.mkdir(parents=True, exist_ok=True)

    tmp_path = dest_dir / f"raw_{csv_file.filename}"
    try:
        with tmp_path.open("wb") as f:
            f.write(await csv_file.read())

        train_from_csv(tmp_path, dest_dir)

        return TrainResponse()
    
    finally:
        tmp_path.unlink(missing_ok=True)