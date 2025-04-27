package com.backend.sesim.domain.auth.dto.request;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class LoginRequest {
    private String email;
    private String password;
}
