package com.backend.sesim.domain.deploy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class DeployOptionsResponse {
    private List<RegionOptionDto> regions;
    private List<InfrastructureSpecOptionDto> infrastructureSpecs;
    private List<ModelOptionDto> models;

    @Getter
    @AllArgsConstructor
    @Builder
    public static class RegionOptionDto {
        private Long id;
        private String name;
        private String code;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class InfrastructureSpecOptionDto {
        private Long id;
        private String ec2Spec;
        private String ec2Info;
    }

    @Getter
    @AllArgsConstructor
    @Builder
    public static class ModelOptionDto {
        private Long id;
        private String name;
        private String description;
        private String version;
        private String framework;
    }
}