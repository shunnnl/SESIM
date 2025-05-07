package com.backend.sesim.domain.iam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AssumeRoleResponse {
    private String accessKey;
    private String secretKey;
    private String sessionToken;
    private Long arnId;

    // 3개 파라미터 생성자 추가
    public AssumeRoleResponse(String accessKey, String secretKey, String sessionToken) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.sessionToken = sessionToken;
    }

    // arnId 설정 메서드 추가
    public void setArnId(Long arnId) {
        this.arnId = arnId;
    }
}
