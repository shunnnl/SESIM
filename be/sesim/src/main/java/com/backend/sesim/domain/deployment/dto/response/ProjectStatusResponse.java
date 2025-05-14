package com.backend.sesim.domain.deployment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatusResponse {
    private Long projectId;
    private String projectName;
    private String description;
    private String albAddress;
    private String grafanaUrl;
    private List<String> allowedIps;   // 허용된 IP 주소 목록
    private List<StepStatus> steps;
    private List<ModelInfo> models;
    private boolean isDeployed;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepStatus {
        private Long stepId;
        private Integer stepOrder;
        private String stepName;
        private String stepStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelInfo {
        private Long modelId;
        private String modelName;
        private String description;
    }
}