import pandas as pd, hashlib, json, logging
from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import APIRouter, HTTPException, UploadFile, File
from app.dto.response import TrainResponse
from app.services.trainer import robust_incremental_training, _read_history
from app.core.config import MODEL_DIR, TRAINING_HISTORY_DIR
from app.core.registry import (
    get_next_model_version,
    get_available_model_versions,
    clear_bundle_cache,
    create_initial_model_structure,
    has_trained_model,
)

router = APIRouter(tags=["학습 API"])
logger = logging.getLogger(__name__)

def is_duplicate_file(csv: Path) -> bool:
    """파일 해시 기반 중복 체크"""
    logger.info("=== 중복 파일 체크 시작 ===")
    
    TRAINING_HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    fh = TRAINING_HISTORY_DIR / "file_hashes.json"
    
    # 현재 파일 해시 계산
    current_hash = hashlib.sha256(csv.read_bytes()).hexdigest()
    logger.info(f"현재 파일 해시: {current_hash}")
    logger.info(f"해시 파일 경로: {fh}")
    
    # 기존 해시 목록 로드
    if fh.exists():
        try:
            hashes = json.loads(fh.read_text())
            logger.info(f"기존 해시 목록: {hashes}")
        except Exception as e:
            logger.error(f"해시 파일 읽기 실패: {e}")
            hashes = []
    else:
        hashes = []
        logger.info("해시 파일이 없습니다. 새로 생성합니다.")
    
    # 중복 체크
    if current_hash in hashes:
        logger.info("🔄 동일한 파일이 이전에 학습되었습니다!")
        return True
    
    # 새 해시 추가
    hashes.append(current_hash)
    try:
        fh.write_text(json.dumps(hashes, indent=2))
        logger.info(f"✅ 새 파일 해시를 저장했습니다. 총 {len(hashes)}개")
    except Exception as e:
        logger.error(f"해시 파일 저장 실패: {e}")
    
    logger.info("=== 중복 파일 체크 완료 ===")
    return False

@router.post("/train", response_model=TrainResponse)
async def train_endpoint(file: UploadFile = File(...)):
    logger.info("🚀 === 학습 엔드포인트 시작 ===")
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV 파일만 가능합니다.")

    # 초기 모델 디렉토리 구조 생성
    create_initial_model_structure()

    with TemporaryDirectory() as tmp:
        tmp_csv = Path(tmp) / file.filename
        tmp_csv.write_bytes(await file.read())
        
        logger.info(f"📁 업로드된 파일: {file.filename}")
        logger.info(f"📊 파일 크기: {tmp_csv.stat().st_size} bytes")

        # 모델 상태 확인
        available_versions = get_available_model_versions()
        has_model = has_trained_model()
        
        logger.info(f"🔍 사용 가능한 모델 버전들: {available_versions}")
        logger.info(f"🎯 학습된 모델 존재 여부: {has_model}")
        logger.info(f"📂 MODEL_DIR 내용: {list(MODEL_DIR.glob('*')) if MODEL_DIR.exists() else '디렉토리 없음'}")

        # 첫 번째 학습인지 확인
        is_first_training = not has_model
        logger.info(f"🆕 첫 번째 학습 여부: {is_first_training}")
        
        # ⭐️ 중복 체크 (첫 번째 학습이든 아니든 항상 체크)
        logger.info("🔄 중복 체크를 시작합니다...")
        if is_duplicate_file(tmp_csv):
            latest = available_versions[0] if available_versions else "1.0.0"
            logger.info(f"⏭️  파일이 중복되어 학습을 스킵합니다. 최신 버전: {latest}")
            return TrainResponse(
                message="파일 전체가 이전과 동일 → 스킵", 
                version=latest
            )
        
        logger.info("✅ 새로운 파일입니다. 학습을 진행합니다.")

        try:
            new_df = pd.read_csv(tmp_csv)
            logger.info(f"📋 CSV 로드 완료: {len(new_df)}행, {len(new_df.columns)}컬럼")
            
            # 필수 컬럼 확인
            required_columns = ["url", "method", "user_agent", "status_code", "is_attack"]
            missing_columns = [col for col in required_columns if col not in new_df.columns]
            if missing_columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"필수 컬럼이 누락되었습니다: {missing_columns}"
                )
            
            # is_attack이 null인 행 처리
            if "is_attack" in new_df.columns and new_df["is_attack"].isnull().any():
                null_count = new_df["is_attack"].isnull().sum()
                new_df["is_attack"] = new_df["is_attack"].fillna(False)
                new_df.to_csv(tmp_csv, index=False)
                logger.info(f"🔧 is_attack null 값 {null_count}개를 False로 처리했습니다.")
                
            # 데이터 사용 (첫 번째든 아니든 전체 데이터 사용)
            novel_df = new_df
            
            if is_first_training:
                logger.info("🌟 첫 번째 모델 학습을 시작합니다.")
            else:
                logger.info("🔄 추가 모델 학습을 시작합니다.")

            # 데이터 검증
            if len(novel_df) < 10:
                raise HTTPException(
                    status_code=400,
                    detail=f"학습 데이터가 부족합니다. 최소 10개 이상의 행이 필요합니다. (현재: {len(novel_df)}개)"
                )
            
            # 공격 데이터 비율 확인
            attack_ratio = novel_df["is_attack"].mean()
            logger.info(f"⚔️  공격 데이터 비율: {attack_ratio:.2%}")
            if attack_ratio == 0:
                logger.warning("⚠️  공격 데이터가 없습니다. 이진 분류만 학습됩니다.")
            elif attack_ratio < 0.01:
                logger.warning(f"⚠️  공격 데이터 비율이 매우 낮습니다: {attack_ratio:.2%}")

            nov_csv = Path(tmp) / "novel.csv"
            novel_df.to_csv(nov_csv, index=False)

            next_ver = get_next_model_version()
            logger.info(f"🏷️  다음 모델 버전: {next_ver}")
            logger.info(f"🎓 모델 학습 시작 - 데이터: {len(novel_df)}행")

            # 통합 모델 학습
            result = robust_incremental_training(csv_path=nov_csv, model_version=next_ver)
            logger.info(f"✅ 학습 완료: {result}")

            # 모델 캐시 초기화
            clear_bundle_cache()
            
            success_message = "첫 번째 모델 학습 완료" if is_first_training else "모델 학습 완료"
            logger.info(f"🎉 {success_message}")
            
            return TrainResponse(
                message=success_message, 
                version=next_ver
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ 학습 중 오류 발생: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"학습 실패: {str(e)}")