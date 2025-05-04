package com.backend.sesim.domain.iam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RoleVerificationResponse {
    private boolean success;
    private String message;
    private String accessKey;
    private String secretKey;
    private String sessionToken;
}
