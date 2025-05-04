package com.backend.sesim.domain.terraform.dto.request;

import lombok.Data;

@Data
public class DeployRequest {
    private String roleArn;        // Assume할 고객 Role ARN
    private String region;         // 배포 대상 리전 (예: ap-northeast-2)
    private String instanceType;   // EC2 인스턴스 타입 (예: t3.medium)
    private String projectName;    // 프로젝트 이름 또는 식별자
    private String terraformDir;   // Terraform 실행할 디렉터리 경로
}

