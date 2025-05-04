import requests


def send_to_ai_model(model_url: str, parsed_logs: list[dict]) -> list[dict]:
    response = requests.post(f"{model_url}/v1/predict", json={"logs": parsed_logs})
    response.raise_for_status()
    return response.json()["results"]
