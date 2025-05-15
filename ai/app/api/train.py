import pandas as pd, hashlib, json
from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import APIRouter, HTTPException, UploadFile, File
from app.dto.response import TrainResponse
from app.services.trainer import robust_incremental_training, _read_history
from app.services.type_trainer import AttackTypeTrainer
from app.core.config import MODEL_DIR, TRAINING_HISTORY_DIR
from app.core.registry import (
    get_next_model_version,
    get_available_model_versions,
    clear_bundle_cache,
)

router = APIRouter(tags=["학습 API"])

def is_duplicate_file(csv: Path) -> bool:
    fh = TRAINING_HISTORY_DIR / "file_hashes.json"
    TRAINING_HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    h = hashlib.sha256(csv.read_bytes()).hexdigest()
    hashes = json.loads(fh.read_text()) if fh.exists() else []
    if h in hashes:
        return True
    hashes.append(h); fh.write_text(json.dumps(hashes, indent=2))
    return False

@router.post("/train", response_model=TrainResponse)
async def train_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 가능합니다.")

    with TemporaryDirectory() as tmp:
        tmp_csv = Path(tmp) / file.filename
        tmp_csv.write_bytes(await file.read())

        if is_duplicate_file(tmp_csv):
            latest = get_available_model_versions()[-1] if get_available_model_versions() else "1.0.0"
            return TrainResponse(message="파일 전체가 이전과 동일 → 스킵", version=latest, skipped=True)

        new_df = pd.read_csv(tmp_csv)

        # 과거 학습 로그
        hist_records = _read_history()
        if hist_records:
            hist_df = pd.DataFrame(hist_records)
            if {"url", "method", "status_code"}.issubset(hist_df.columns):
                cols = ["url", "method", "status_code"]
                merged = new_df.merge(hist_df[cols].drop_duplicates(),
                                      on=cols, how="left", indicator=True)
                novel_df = new_df[merged["_merge"].eq("left_only")].reset_index(drop=True)
            else:
                novel_df = new_df
        else:
            novel_df = new_df

        if novel_df.empty:
            latest = get_available_model_versions()[-1]
            return TrainResponse(message="모든 행이 중복 → 학습 스킵", version=latest, skipped=True)

        nov_csv = Path(tmp) / "novel.csv"
        novel_df.to_csv(nov_csv, index=False)

        next_ver = get_next_model_version()
        dest_dir = MODEL_DIR / f"model_v{next_ver}"

        robust_incremental_training(csv_path=nov_csv, model_version=next_ver)

        # 유형 분류 (공격행만)
        atk_df = novel_df[novel_df["is_attack"] == True]
        if not atk_df.empty:
            AttackTypeTrainer(next_ver).train(nov_csv)

        clear_bundle_cache()
        return TrainResponse(message="모델 학습 완료", version=next_ver, skipped=False)
