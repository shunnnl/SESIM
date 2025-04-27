package com.backend.sesim.global.security.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum JwtErrorCode implements ErrorCode {

    TOKEN_NOT_FOUND(401, "토큰을 찾을 수 없습니다."),
    TOKEN_NOT_VALID(404, "유효하지 않은 토큰입니다."),
    REFRESH_NOT_VALID(404, "유효하지 않은 리프레쉬 토큰입니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
