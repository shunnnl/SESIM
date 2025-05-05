import re
import os
import joblib
import numpy as np
from pathlib import Path
from urllib.parse import unquote
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import hstack, csr_matrix
from app.core.config import MODEL_DIR, MODEL_VERSION

app = FastAPI()

model_dir = MODEL_DIR / f"model_v{MODEL_VERSION}"

try:
    model = joblib.load(model_dir / f"xgboost_nginx_model_v{MODEL_VERSION}.pkl")
    tfidf = joblib.load(model_dir / f"tfidf_vectorizer_v{MODEL_VERSION}.pkl")
except Exception as e:
    raise RuntimeError(f"❌ 모델 파일 로딩 실패: {e}")

method_encoder = LabelEncoder()
method_encoder.fit(["GET", "POST"])

agent_encoder = LabelEncoder()
agent_encoder.fit([
    "Mozilla/5.0", "curl/7.64.1", "sqlmap/1.5", "python-requests/2.25"
])

def preprocess_url(url: str) -> str:
    url = unquote(url)
    url = url.replace("+", " ")
    return url 

def render_form(method="GET", status_code="200", user_agent="Mozilla/5.0", path="", result=""):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>공격 탐지 테스트</title>
        <style>
            body {{ font-family: Arial; padding: 30px; max-width: 800px; margin: auto; }}
            input, select {{ font-size: 16px; padding: 5px; width: 100%; }}
            input[type="submit"] {{ font-size: 18px; padding: 10px 20px; margin-top: 15px; }}
            .result {{ margin-top: 30px; font-size: 22px; font-weight: bold; }}
            .example {{ margin-top: 20px; color: #666; }}
        </style>
    </head>
    <body>
        <h2>🚨 공격 탐지 테스트</h2>
        <form method="post">
            <p>Method:
                <select name="method">
                    <option value="GET" {{'selected' if method == 'GET' else ''}}>GET</option>
                    <option value="POST" {{'selected' if method == 'POST' else ''}}>POST</option>
                </select>
            </p>
            <p>Status Code: <input type="number" name="status_code" value="{status_code}"></p>
            <p>User-Agent: <input type="text" name="user_agent" value="{user_agent}"></p>
            <p>URL: 
               <input type="text" name="path" value="{path}">
            </p>
            <input type="submit" value="탐지 실행">
        </form>
        <div class="result">{result}</div>
        <div class="example">
            <p><strong>테스트 예시:</strong></p>
            <ul>
                <li>SQL 인젝션: <code>/dashboard?user=admin; DROP TABLE users; --</code></li>
                <li>XSS 공격: <code>/search?q=&lt;script&gt;alert('xss')&lt;/script&gt;</code></li>
                <li>경로 탐색: <code>/view?include=../../../etc/passwd</code></li>
                <li>일반 요청: <code>/products?category=electronics</code></li>
            </ul>
        </div>
    </body>
    </html>
    """

@app.get("/", response_class=HTMLResponse)
def get_form():
    return render_form()

@app.post("/", response_class=HTMLResponse)
def detect_attack(method: str = Form(...),
                  status_code: int = Form(...),
                  user_agent: str = Form(...),
                  path: str = Form(...)):

    url = preprocess_url(path)

    try:
        method_encoded = method_encoder.transform([method])[0]
    except:
        method_encoded = 0

    try:
        agent_encoded = agent_encoder.transform([user_agent])[0]
    except:
        agent_encoded = 0

    features = [
        method_encoded, status_code, agent_encoded, len(url),
        int("select" in url.lower()), int("alert" in url.lower()),
        int("script" in url.lower()), int("div" in url.lower()),
        int("../" in url), int("%" in url), int("or" in url.lower()),
        int("and" in url.lower()), int("=" in url),
        int("'" in url or '"' in url), int("union" in url.lower()), int("--" in url),
        int("admin" in url.lower())
    ]

    url_vector = tfidf.transform([url])
    X_input = hstack([csr_matrix([features]), url_vector])
    is_attack = model.predict(X_input)[0]
    prob = model.predict_proba(X_input)[0][1]

    result_html = f"""
        <span style="color:{'red' if is_attack else 'green'};">
        🔍 탐지 결과: {'공격' if is_attack else '정상'} (확률: {prob:.2f})
        </span>
    """

    return render_form(method=method, status_code=str(status_code), user_agent=user_agent, path=path, result=result_html)