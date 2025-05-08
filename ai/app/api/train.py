import pandas as pd
import hashlib, json
from pathlib import Path
from tempfile import TemporaryDirectory
from app.dto.response import TrainResponse
from app.core.config import MODEL_DIR, TRAINING_HISTORY_DIR
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.trainer import robust_incremental_training, _read_history
from app.core.registry import (
    get_next_model_version,
    get_available_model_versions,
    clear_bundle_cache,
)


router = APIRouter(tags=["학습 API"])

# ---------- 파일 해시 ---------- #
def is_duplicate_file(csv_path: Path) -> bool:
    TRAINING_HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    fh_path = TRAINING_HISTORY_DIR / "file_hashes.json"

    h = hashlib.sha256(csv_path.read_bytes()).hexdigest()
    hashes = json.loads(fh_path.read_text()) if fh_path.exists() else []
    if h in hashes:
        return True

    hashes.append(h)
    fh_path.write_text(json.dumps(hashes, indent=2))
    return False

# ---------- 엔드포인트 ---------- #
@router.post("/train", response_model=TrainResponse)
async def train_endpoint(file: UploadFile = File(..., description="CSV 로그")):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 가능합니다.")

    with TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir) / file.filename
        tmp_path.write_bytes(await file.read())

        # 1) 파일‑중복 검사
        if is_duplicate_file(tmp_path):
            latest = get_available_model_versions()[-1] if get_available_model_versions() else "1.0.0"
            return TrainResponse(message="파일 전체가 이전과 동일 → 스킵", version=latest, skipped=True)

        # 2) CSV 파싱
        try:
            new_df = pd.read_csv(tmp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"CSV 파싱 오류: {e}")

        # 3) 행‑중복 분리
        hist_df = _read_history()
        cols = ["url", "method", "status_code"]

        if not hist_df.empty:
            df_norm   = new_df[cols].applymap(lambda x: str(x).strip())
            hist_norm = hist_df[cols].applymap(lambda x: str(x).strip())

            merged = df_norm.merge(hist_norm.drop_duplicates(),
                                   on=cols, how="left", indicator=True)
            novel_mask = merged["_merge"].eq("left_only")
            novel_df = new_df.loc[novel_mask].reset_index(drop=True)
        else:
            novel_df = new_df

        if novel_df.empty:
            latest = get_available_model_versions()[-1]
            return TrainResponse(message="모든 행이 중복 → 학습 스킵",
                                 version=latest, skipped=True)

        # 4) novel_df 만 임시 CSV로 저장해 학습 호출
        novel_csv = Path(tmpdir) / "novel_only.csv"
        novel_df.to_csv(novel_csv, index=False)

        next_version = get_next_model_version()
        dest_dir = MODEL_DIR / f"model_v{next_version}"

        try:
            robust_incremental_training(
                csv_path=novel_csv,
                model_dir=dest_dir,
                model_version=next_version,
                force_full_retrain=False,
            )
            clear_bundle_cache()

        except RuntimeError as e:
            # 실패 시 빈 폴더 정리
            if dest_dir.exists() and not any(dest_dir.iterdir()):
                import shutil
                shutil.rmtree(dest_dir)
            raise HTTPException(status_code=500, detail=str(e))

    return TrainResponse(message=f"모델 학습 완료 (버전: {next_version})",
                         version=next_version)
