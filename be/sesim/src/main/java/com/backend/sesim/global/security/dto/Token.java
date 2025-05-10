package com.backend.sesim.global.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Builder
@Getter
@AllArgsConstructor
public class Token {
    private String accessToken;
    private String refreshToken;  // HTTP-Only 쿠키로 전송될 때는 null이 됨
    private LocalDateTime accessTokenExpiresInForHour;
}
