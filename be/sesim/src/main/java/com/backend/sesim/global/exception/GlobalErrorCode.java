package com.backend.sesim.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

//애플리케이션에서 발생할 수 있는 모든 에러의 종류를 정의
@Getter
@RequiredArgsConstructor
public enum GlobalErrorCode implements ErrorCode {
    // 공통 에러
    INVALID_INPUT_VALUE(400, "잘못된 입력값입니다"),
    INTERNAL_SERVER_ERROR(500, "서버 오류가 발생했습니다"),
    RESOURCE_NOT_FOUND(404, "요청한 리소스를 찾을 수 없습니다"),
    METHOD_NOT_ALLOWED(405, "지원하지 않는 HTTP 메소드입니다"),
    MEDIA_TYPE_NOT_ACCEPTABLE(406, "지원하지 않는 미디어 타입입니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name(); //String code 부분에 enum의 name을 넣으면 되므로 파라미터로 400이랑 message만 있으면 된다!
    }
}
