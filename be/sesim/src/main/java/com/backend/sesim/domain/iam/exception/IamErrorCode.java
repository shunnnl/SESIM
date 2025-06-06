package com.backend.sesim.domain.iam.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum IamErrorCode implements ErrorCode {
    ASSUME_ROLE_FAILED(400, "AssumeRole 검증에 실패했습니다."),
    INVALID_ROLE_ARN(400, "유효하지 않은 Role ARN입니다."),
    CREDENTIALS_NOT_FOUND(404, "자격 증명을 찾을 수 없습니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}