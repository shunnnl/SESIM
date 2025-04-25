package com.backend.sesim.domain.auth.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {
    USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
