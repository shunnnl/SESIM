package com.backend.sesim.domain.auth.dto.request;

import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class RefreshTokenRequest {
    String refreshToken;
}
