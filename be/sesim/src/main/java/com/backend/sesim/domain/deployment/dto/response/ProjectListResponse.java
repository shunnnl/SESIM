package com.backend.sesim.domain.deployment.dto.response;

import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectListResponse {
    private List<ProjectDto> projects;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectDto {
        private Long id;
        private String name;
        private String description;
        private boolean isDeployed;  // 배포 완료 여부 필드 추가
        private List<ModelDto> models;

        public static ProjectDto from(Project project, boolean isDeployed) {
            List<ModelDto> modelDtos = project.getModelInformations().stream()
                    .map(ModelDto::from)
                    .collect(Collectors.toList());

            return ProjectDto.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .description(project.getDescription())
                    .isDeployed(isDeployed)  // 배포 상태 설정
                    .models(modelDtos)
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ModelDto {
        private Long id;
        private String name;
        private String description; // short_description의 첫 번째 줄
        private String grafanaUrl;  // 그라파나 URL 추가

        public static ModelDto from(ProjectModelInformation modelInfo) {
            // short_description에서 첫 번째 줄 추출
            String firstLine = "";
            if (modelInfo.getModel().getShortDescription() != null) {
                String[] lines = modelInfo.getModel().getShortDescription().split("\\n");
                if (lines.length > 0) {
                    firstLine = lines[0];
                }
            }

            // ALB 주소에서 그라파나 URL 생성
            String grafanaUrl = "";
            if (modelInfo.getProject().getAlbAddress() != null && !modelInfo.getProject().getAlbAddress().isEmpty()) {
                String albAddress = modelInfo.getProject().getAlbAddress();

                // 도메인 부분만 추출 (http://13.125.10.230)
                int indexOfApi = albAddress.indexOf("/api");
                if (indexOfApi > 0) {
                    // "/api" 이전 부분만 추출하고 "/grafana" 추가
                    grafanaUrl = albAddress.substring(0, indexOfApi) + "/grafana";
                } else {
                    // "/api"가 없는 경우 끝에 "/grafana" 추가
                    grafanaUrl = albAddress + "/grafana";
                }
            }

            return ModelDto.builder()
                    .id(modelInfo.getModel().getId())
                    .name(modelInfo.getModel().getName())
                    .description(firstLine)
                    .grafanaUrl(grafanaUrl)
                    .build();
        }
    }

    public static ProjectListResponse from(List<Project> projects, Map<Long, Boolean> deploymentStatusMap) {
        List<ProjectDto> projectDtos = projects.stream()
                .map(project -> ProjectDto.from(project, deploymentStatusMap.getOrDefault(project.getId(), false)))
                .collect(Collectors.toList());

        return ProjectListResponse.builder()
                .projects(projectDtos)
                .build();
    }
}