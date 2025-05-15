# SESIM AI SDK

SESIM AI SDK는 로그 파일을 기반으로 공격 탐지 AI 모델을 연동할 수 있도록 도와주는 Python 클라이언트입니다.  
예측, 학습 요청, 파일 업로드, 로그 목록 조회 등의 기능을 간편하게 사용할 수 있습니다.

---

## 📦 설치 방법

### 1. SDK 다운로드

[🔽 SDK 다운로드 (.whl)](http://www.sesim.site/sdk-download)

### 2. 설치 명령어

```bash
pip install ./sesim_ai_sdk-0.1.0-py3-none-any.whl
```
requests 라이브러리는 자동으로 함께 설치됩니다.

---

#### 🔌 기본 사용 예시

``` python

from ai_sdk.client import AIClient

# ✅ 실제 API 정보 및 API key 입력
API_URL = "고객 API 주소"
API_KEY = "고객 API key"

# ✅ 모델 ID, AI ID, 모델 학습 파일, 예측 파일 경로 입력
MODEL_ID = 1
AI_TRAIN_ID = 1
TRAIN_FILE_PATH = "모델 학습 파일 경로"
PREDICT_FILE_PATH = "모델 예측 파일 경로"

client = AIClient(base_url=API_URL, api_key=API_KEY)

# 1. 로그 업로드
upload_result = client.upload_log_file(model_id=MODEL_ID, file_path=TRAIN_FILE_PATH)
print("업로드 응답:", upload_result)

# 2. 업로드된 로그 목록 조회
logs = client.list_uploaded_files(model_id=MODEL_ID)
print("업로드된 로그 목록:", logs)

# 3. 모델 학습 요청
train_response = client.train_model(model_id=MODEL_ID, ai_train_id=AI_TRAIN_ID)
print("학습 요청 결과:", train_response)

# 4. 예측 요청
result = client.predict_file(model_id=MODEL_ID, file_path=PREDICT_FILE_PATH)
print("예측 결과:", result)

```

## 🔐 인증
모든 요청에는 발급받은 api-key가 헤더에 포함되어야 합니다.

```python
headers = {
    "api-key": "your-api-key"
}
```

- API Key가 누락되거나 잘못되면 401 Unauthorized 응답이 발생합니다.


## 📂 주요 기능 요약

| 기능             | 메서드                | 설명                                         |
|------------------|------------------------|----------------------------------------------|
| 로그 파일 예측   | `predict_file()`       | 로그 파일을 기반으로 AI 예측 수행 (비동기 처리) |
| 로그 파일 업로드 | `upload_log_file()`    | 모델 학습용 로그 파일을 서버에 업로드         |
| 업로드 목록 조회 | `list_uploaded_files()`| 지정 모델에 업로드된 파일 목록 반환            |
| 모델 학습 요청   | `train_model()`        | 지정 모델과 파일 ID를 기반으로 학습 요청       |


## 🛠️ 지원 환경
- Python 3.7 이상
- requests 2.0 이상


## 🧑‍💻 개발 및 유지관리

- 개발팀: SESIM S109 팀
- 이메일: qowlgo00@gmail.com
- 버전: 0.1.0