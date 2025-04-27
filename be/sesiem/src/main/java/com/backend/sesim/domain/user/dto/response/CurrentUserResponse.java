package com.backend.sesim.facade.user.dto.response;

import java.util.Date;
import java.util.List;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserResponse {
    private Long userId;
    private String email;
    private String nickname;
}