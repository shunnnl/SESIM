package com.backend.sesiem.global.exception;

public interface ErrorCode {
    String code();

    String getMessage();

    int getStatus();
}
