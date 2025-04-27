package com.backend.sesim.domain.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserResponse {
    private Long userId;
    private String email;
    private String nickname;
}