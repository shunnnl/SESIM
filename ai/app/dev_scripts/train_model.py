import sys
import os
from pathlib import Path

# 프로젝트 루트 디렉토리를 경로에 추가
project_root = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(project_root))

import joblib
import pandas as pd
import xgboost as xgb
from scipy.sparse import hstack, csr_matrix
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer

from app.core.config import DATA_DIR, MODEL_PATH, VECTORIZER_PATH
from app.utils import extract_url_features, preprocess_url


csv_path = os.path.join(DATA_DIR, "nginx_ai_attack_dataset.csv")
df = pd.read_csv(csv_path)
print(f" 데이터 로딩 완료 (총 {len(df)}건)")


target_col = 'is_attack'

df['decoded_url'] = df['url'].astype(str).apply(preprocess_url)

df = extract_url_features(df, url_column='decoded_url')

le_method = LabelEncoder()
le_method.fit(["GET", "POST"])
df['method'] = le_method.transform(df['method'])

le_agent = LabelEncoder()
le_agent.fit([
    "Mozilla/5.0", "curl/7.64.1", "sqlmap/1.5", "python-requests/2.25"
])
df['user_agent'] = le_agent.transform(df['user_agent'])

X_basic = df[[
    'method', 'status_code', 'user_agent', 'url_len',
    'has_select', 'has_alert', 'has_script', 'has_div',
    'has_dotdot', 'has_percent', 'has_or', 'has_and',
    'has_eq', 'has_quote', 'has_union', 'has_dash', 'has_admin'
]]

tfidf = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), max_features=500)
X_url = tfidf.fit_transform(df['decoded_url'])

X = hstack([csr_matrix(X_basic.values), X_url])
y = df[target_col].astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = xgb.XGBClassifier(
    n_estimators=150,
    learning_rate=0.1,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    use_label_encoder=False,
    eval_metric='logloss',
    random_state=42
)
model.fit(X_train, y_train)

# 평가
y_proba = model.predict_proba(X_test)[:, 1]
y_pred = (y_proba > 0.6).astype(int)

print("\n📊 분류 리포트:")
print(classification_report(y_test, y_pred))

print("\n🔍 예측 결과 샘플:")
print("실제값:", y_test[:10].values)
print("예측값:", y_pred[:10])

# 모델 저장
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(model, MODEL_PATH)
joblib.dump(tfidf, VECTORIZER_PATH)

print(f"\n 모델 저장 완료:")
print(f"- 모델 경로      : {MODEL_PATH}")
print(f"- 벡터라이저 경로: {VECTORIZER_PATH}")