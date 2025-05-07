package com.backend.sesim.domain.deployment.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DeploymentErrorCode implements ErrorCode {

    UNAUTHORIZED_PROJECT_ACCESS(403, "해당 프로젝트에 대한 접근 권한이 없습니다."),
    API_KEY_ALREADY_CHECKED(400, "이미 확인된 API 키입니다."),

    MODEL_INFO_NOT_FOUND(404, "해당 프로젝트의 모델 정보를 찾을 수 없습니다."),
    PROJECT_NOT_FOUND(404, "프로젝트를 찾을 수 없습니다.");



    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}