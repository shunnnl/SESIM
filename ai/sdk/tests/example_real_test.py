from ai_sdk.client import AIClient

API_URL = "test_api_key"
API_KEY = "test_api_key"
MODEL_ID = 1
TRAIN_FILE_PATH = "모델 학습 파일 경로"
TRAIN_TEST_FILE_PATH = "모델 테스트 파일 경로"
AI_TRAIN_ID = 1

client = AIClient(API_URL, api_key=API_KEY)

# 1. 로그 파일 업로드
print("📤 파일 업로드 중...")
upload_res = client.upload_log_file(model_id=MODEL_ID, file_path=TRAIN_FILE_PATH)
print("✅ 파일 업로드 결과:", upload_res)

# 2. 업로드된 파일 목록 조회
print("📂 업로드 목록 조회 중...")
log_list = client.list_uploaded_files(model_id=MODEL_ID)
print("✅ 업로드 목록:", log_list)

# 3. 모델 학습 요청
print("🧠 모델 학습 요청 중...")
train_res = client.train_model(model_id=MODEL_ID, ai_train_id=AI_TRAIN_ID)
print("✅ 학습 결과:", train_res)

# 4. 예측 요청
print("📡 예측 요청 중...")
predict_res = client.predict_file(model_id=MODEL_ID, file_path=TRAIN_TEST_FILE_PATH)
print("✅ 예측 결과:", predict_res)
