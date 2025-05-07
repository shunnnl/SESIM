import os

import requests
from fastapi import HTTPException


def send_to_ai_model(model_url: str, parsed_logs: list[dict]) -> dict:
    """
    AI 서버의 /api/predict 엔드포인트로 로그를 전송하고 결과를 반환합니다.
    """
    try:
        response = requests.post(f"{model_url}/api/predict", json={"logs": parsed_logs})
        response.raise_for_status()
        return response.json()  # {"results": [...]}
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"AI 서버 응답 오류: {e.response.text}")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"AI 서버 요청 실패: {str(e)}")


def send_train_file(model_url: str, file_path: str) -> dict:
    """
    AI 서버의 /api/train 엔드포인트로 파일을 전송하여 학습을 요청합니다.
    """
    try:
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f)}
            response = requests.post(f"{model_url}/api/train", files=files)

        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"AI 서버 응답 오류: {e.response.text}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"AI 서버 요청 실패: {str(e)}")
