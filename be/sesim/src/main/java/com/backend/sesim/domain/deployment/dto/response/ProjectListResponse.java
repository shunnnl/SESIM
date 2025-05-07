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
        private List<ModelDto> models;

        public static ProjectDto from(Project project) {
            List<ModelDto> modelDtos = project.getModelInformations().stream()
                    .map(ModelDto::from)
                    .collect(Collectors.toList());

            return ProjectDto.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .description(project.getDescription())
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

        public static ModelDto from(ProjectModelInformation modelInfo) {
            // short_description에서 첫 번째 줄 추출
            String firstLine = "";
            if (modelInfo.getModel().getShortDescription() != null) {
                String[] lines = modelInfo.getModel().getShortDescription().split("\\n");
                if (lines.length > 0) {
                    firstLine = lines[0];
                }
            }

            return ModelDto.builder()
                    .id(modelInfo.getModel().getId())
                    .name(modelInfo.getModel().getName())
                    .description(firstLine)
                    .build();
        }
    }

    public static ProjectListResponse from(List<Project> projects) {
        List<ProjectDto> projectDtos = projects.stream()
                .map(ProjectDto::from)
                .collect(Collectors.toList());

        return ProjectListResponse.builder()
                .projects(projectDtos)
                .build();
    }
}