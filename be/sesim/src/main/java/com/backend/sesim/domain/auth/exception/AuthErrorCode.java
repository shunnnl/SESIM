package com.backend.sesim.domain.auth.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {
    USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다."),
    EMAIL_ALREADY_EXISTS(400, "이미 사용 중인 이메일입니다."),
    INVALID_PASSWORD(402, "비밀번호가 일치하지 않습니다"),
    EMAIL_NOT_FOUND(404, "등록되지 않은 이메일입니다."),
    USER_DELETED(403, "탈퇴한 사용자입니다.");


    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}
