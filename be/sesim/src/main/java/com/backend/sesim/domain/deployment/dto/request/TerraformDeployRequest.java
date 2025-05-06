package com.backend.sesim.domain.deployment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
public class TerraformDeployRequest {
    // ARN ID만 받기 (이미 검증 완료된 ARN의 ID)
    private Long arnId;

    // 프로젝트 정보
    private String projectName;       // 프로젝트 이름
    private String projectDescription; // 프로젝트 설명

    // 모델 구성 정보 - 여러 개 선택 가능
    private List<ModelConfig> modelConfigs;

    // AWS 자격 증명 정보 (향후 사용을 위해 유지)
    private String accessKey;
    private String secretKey;
    private String sessionToken;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModelConfig {
        private Long modelId;      // 모델 ID
        private Long specId;       // 인프라 사양 ID
        private Long regionId;     // 리전 ID
    }
}