package com.backend.sesim.domain.deployment.dto.response;

import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDeploymentResponse {
    private List<ProjectStatusDto> projects;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectStatusDto {
        private Long id;
        private String name;
        private List<DeployedModelDto> models;

        public static ProjectStatusDto from(Project project) {
            List<DeployedModelDto> modelDtos = project.getModelInformations().stream()
                    .map(DeployedModelDto::from)
                    .collect(Collectors.toList());

            return ProjectStatusDto.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .models(modelDtos)
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeployedModelDto {
        private Long id;
        private String name;
        private String albAddress;
        private Boolean isApiKeyCheck;

        public static DeployedModelDto from(ProjectModelInformation modelInfo) {
            return DeployedModelDto.builder()
                    .id(modelInfo.getModel().getId())
                    .name(modelInfo.getModel().getName())
                    .albAddress(modelInfo.getProject().getAlbAddress())
                    .isApiKeyCheck(modelInfo.getIsApiKeyCheck())
                    .build();
        }
    }

    public static ProjectDeploymentResponse from(List<Project> projects) {
        List<ProjectStatusDto> projectDtos = projects.stream()
                .map(ProjectStatusDto::from)
                .collect(Collectors.toList());

        return ProjectDeploymentResponse.builder()
                .projects(projectDtos)
                .build();
    }
}