import pytest
from ai_sdk.client import AIClient
import io


# 예측 API 테스트 (predict_file
def test_predict_file(monkeypatch):
    class MockResponse:
        status_code = 200
        def json(self):
            return {"message": "비동기 파일 예측 처리가 시작되었습니다."}

    monkeypatch.setattr("requests.post", lambda *args, **kwargs: MockResponse())
    monkeypatch.setattr("builtins.open", lambda file, mode='rb': io.BytesIO(b"log contents"))

    client = AIClient("http://localhost:8000", api_key="test-key")
    result = client.predict_file(model_id=1, file_path="./fake.log")
    assert result == "비동기 파일 예측 처리가 시작되었습니다."


# 로그 업로드 API 테스트 (upload_log_file)
def test_upload_log_file(monkeypatch):
    class MockResponse:
        status_code = 200
        def json(self):
            return {
                "message": "학습 데이터 업로드 성공",
                "response": {
                    "path": "/mnt/data/train_data/model_1/fake.log"
                }
            }

    monkeypatch.setattr("requests.post", lambda *args, **kwargs: MockResponse())
    monkeypatch.setattr("builtins.open", lambda file, mode='rb': io.BytesIO(b"fake log"))

    client = AIClient("http://localhost:8000", api_key="test-key")
    res = client.upload_log_file(model_id=1, file_path="./fake.log")
    assert res["message"] == "학습 데이터 업로드 성공"
    assert "path" in res["response"]


# 모델 학습 요청 API 테스트 (train_model)
def test_train_model(monkeypatch):
    class MockResponse:
        status_code = 200
        def json(self):
            return {
                "message": "AI 서버에 학습 요청이 완료되었습니다.",
                "response": {
                    "status": "success",
                    "detail": "Training started."
                }
            }

    monkeypatch.setattr("requests.post", lambda *args, **kwargs: MockResponse())

    client = AIClient("http://localhost:8000", api_key="test-key")
    res = client.train_model(model_id=1, ai_train_id=123)
    assert res["message"] == "AI 서버에 학습 요청이 완료되었습니다."


# 업로드된 파일 목록 조회 API 테스트 (list_uploaded_files)
def test_list_uploaded_files(monkeypatch):
    class MockResponse:
        status_code = 200
        def json(self):
            return [
                {
                    "message": "업로드 기록",
                    "response": {
                        "ai_train_id": 5,
                        "path": "/mnt/data/train_data/model_1/20240509_sample.log",
                        "created_at": "2025-05-09T09:11:30.000Z"
                    }
                }
            ]

    monkeypatch.setattr("requests.get", lambda *args, **kwargs: MockResponse())

    client = AIClient("http://localhost:8000", api_key="test-key")
    logs = client.list_uploaded_files(model_id=1)

    assert isinstance(logs, list)
    assert logs[0]["response"]["ai_train_id"] == 5