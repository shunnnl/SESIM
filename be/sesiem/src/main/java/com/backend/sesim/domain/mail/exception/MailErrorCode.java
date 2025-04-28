package com.backend.sesim.domain.mail.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MailErrorCode implements ErrorCode {

    EMAIL_SEND_FAILED(500, "이메일 발송에 실패했습니다."),
    INVALID_VERIFICATION_CODE(400, "잘못된 인증 코드입니다."),
    VERIFICATION_CODE_EXPIRED(400, "인증 코드가 만료되었습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}