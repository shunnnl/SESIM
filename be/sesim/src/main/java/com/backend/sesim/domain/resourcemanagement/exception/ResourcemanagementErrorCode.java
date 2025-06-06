package com.backend.sesim.domain.resourcemanagement.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ResourcemanagementErrorCode implements ErrorCode {
    MODEL_NOT_FOUND(404, "모델을 찾을 수 없습니다."),
    API_EXAMPLE_NOT_FOUND(404,"API 예제 코드를 찾을 수 없습니다.");
    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}