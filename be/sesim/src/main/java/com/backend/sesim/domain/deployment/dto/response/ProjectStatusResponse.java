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
    private String albAddress;
    private List<StepStatus> steps;
    private List<ModelInfo> models;

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
        private boolean isApiKeyCheck;
    }
}