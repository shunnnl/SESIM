FROM python:3.10-slim

WORKDIR /temp

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY ./app /temp/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
