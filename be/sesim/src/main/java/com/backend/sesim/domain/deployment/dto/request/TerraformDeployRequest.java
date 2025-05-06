package com.backend.sesim.domain.deployment.dto.request;

import lombok.Getter;

@Getter
public class TerraformDeployRequest {
    private String iamRoleArn;
    private String accessKey;
    private String secretKey;
    private String sessionToken;
    private String deploymentId; // 고유한 프로젝트 이름 (e.g., UUID)
}