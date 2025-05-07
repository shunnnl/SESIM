import requests


def send_to_ai_model(model_url: str, parsed_logs: list[dict]) -> dict:
    """
    AI 서버의 /api/predict 엔드포인트로 로그를 전송하고 결과를 반환합니다.
    :param model_url: AI 서버의 기본 URL (예: http://ai-server:8001)
    :param parsed_logs: 전처리된 로그 리스트
    :return: AI 서버로부터 받은 전체 응답 JSON (예: {"results": [...]})
    """
    try:
        response = requests.post(f"{model_url}/api/predict", json={"logs": parsed_logs})
        response.raise_for_status()
        return response.json()  # ✅ results 키까지 백엔드에서 분리
    except requests.exceptions.HTTPError as e:
        raise RuntimeError(f"AI 서버 응답 오류: {e.response.text}")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"AI 서버 요청 실패: {str(e)}")

