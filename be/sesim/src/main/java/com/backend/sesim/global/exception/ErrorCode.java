package com.backend.sesim.global.exception;

public interface ErrorCode {
    String code();

    String getMessage();

    int getStatus();
}
