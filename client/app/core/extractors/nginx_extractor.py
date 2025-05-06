# Nginx Log 추출기
# nginx_extractor.py

import re
from typing import Optional

# Nginx 로그 정규표현식 패턴
log_pattern = re.compile(
    r'(?P<client_ip>\S+) - - \[(?P<logged_at>.*?)\] '
    r'"(?P<method>\S+) (?P<url>\S+) (?P<protocol>\S+)" '
    r'(?P<status_code>\d{3}) (?P<size>\d+) "(?P<referer>.*?)" "(?P<user_agent>.*?)"'
)


def parse_log_line(line: str) -> Optional[dict]:
    """
    Nginx 로그 한 줄을 파싱해서 딕셔너리 반환

    Args:
        line (str): Nginx 로그 한 줄

    Returns:
        dict | None: 파싱 성공 시 필드 딕셔너리, 실패 시 None
    """
    match = log_pattern.match(line.strip())
    return match.groupdict() if match else None


def parse_log_lines(lines: list[str]) -> list[dict]:
    """
    여러 줄의 Nginx 로그를 파싱하여 딕셔너리 리스트로 반환

    Args:
        lines (list[str]): Nginx 로그 라인 목록

    Returns:
        list[dict]: 각 라인의 필드를 담은 딕셔너리 목록
    """
    return [parsed for line in lines if (parsed := parse_log_line(line))]
