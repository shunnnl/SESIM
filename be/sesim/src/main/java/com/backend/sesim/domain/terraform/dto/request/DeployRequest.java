package com.backend.sesim.domain.terraform.dto.request;

import lombok.Getter;

@Getter
public class DeployRequest {
    private String region;
    private String instanceType;
    private String amiId;
    private String iamRoleArn;
    private String accessKey;
    private String secretKey;
    private String sessionToken;
    private String deploymentId; // 고유한 프로젝트 이름 (e.g., UUID)
}