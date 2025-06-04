package com.backend.sesim.domain.user.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {

    // 회원 탈퇴 관련 에러 코드
    PASSWORD_MISMATCH(400, "현재 비밀번호가 일치하지 않습니다."),
    ALREADY_DELETED_USER(400, "이미 탈퇴한 회원입니다.");


    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}