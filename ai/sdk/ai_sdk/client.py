import requests
from ai_sdk.exceptions import APIError


class AIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "api-key": api_key
        }


    def predict_file(self, model_id: int, file_path: str) -> str:
        """
        로그 파일을 기반으로 비동기 예측 요청을 전송합니다.
        """
        url = f"{self.base_url}/api/v1/predict/file"
        files = {
            "model_id": (None, str(model_id)),
            "file": open(file_path, "rb")
        }

        response = requests.post(url, files=files, headers=self.headers)
        if response.status_code != 200:
            raise APIError(f"[예측 실패] {response.status_code}: {response.text}")
        return response.json().get("message", "")


    def train_model(self, model_id: int, ai_train_id: int) -> dict:
        """
        지정한 모델과 학습 파일 ID를 기반으로 학습 요청을 전송합니다.
        """
        url = f"{self.base_url}/api/admin/train/{model_id}"
        params = {"ai_train_id": ai_train_id}

        response = requests.post(url, headers=self.headers, params=params)
        if response.status_code != 200:
            raise APIError(f"[학습 실패] {response.status_code}: {response.text}")
        return response.json()


    def upload_log_file(self, model_id: int, file_path: str) -> dict:
        """
        지정한 모델 ID로 로그 파일을 업로드합니다.
        """
        url = f"{self.base_url}/api/admin/train/file/upload"
        files = {
            "model_id": (None, str(model_id)),
            "file": open(file_path, "rb")
        }

        response = requests.post(url, files=files, headers=self.headers)
        if response.status_code != 200:
            raise APIError(f"[파일 업로드 실패] {response.status_code}: {response.text}")
        return response.json()


    def list_uploaded_files(self, model_id: int) -> list:
        """
        지정한 모델에 업로드된 학습 로그 파일 목록을 조회합니다.
        """
        url = f"{self.base_url}/api/admin/train/{model_id}"

        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise APIError(f"[업로드 목록 조회 실패] {response.status_code}: {response.text}")
        return response.json()