package com.backend.sesim.facade.auth.dto.request;

import com.backend.sesim.global.security.dto.Token;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class LoginResponse {
    private Long id;
    private String email;
    private String nickname;
    private Token token;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
}
