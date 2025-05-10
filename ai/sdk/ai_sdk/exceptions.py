class APIError(Exception):
    """모든 API 호출 관련 예외의 최상위 클래스"""
    def __init__(self, message: str, status_code: int = None):
        super().__init__(message)
        self.status_code = status_code