package com.backend.sesim.domain.deployment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsageResponse {
    private List<ProjectApiUsageDto> projects;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectApiUsageDto {
        private Long projectId;
        private String projectName;
        private int projectTotalRequestCount;   // 프로젝트별 API 요청 수 합계
        private int projectTotalSeconds;        // 프로젝트별 사용 시간 합계
        private double projectTotalCost;
        private List<ModelApiUsageDto> models;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModelApiUsageDto {
        private Long modelId;
        private String modelName;
        private int totalRequestCount;  // 모델별 API 요청 수
        private int totalSeconds;       // 모델별 사용 시간(초)
        private double hourlyRate;          // 모델 시간당 비용 (USD)
        private double totalCost;           // 모델 총 사용 금액 (USD)
    }
}