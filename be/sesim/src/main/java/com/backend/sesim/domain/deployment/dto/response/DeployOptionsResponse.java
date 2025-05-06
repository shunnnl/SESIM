package com.backend.sesim.domain.deployment.dto.response;

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
    private List<CombinedPriceInfoDto> combinedPrices;

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
        private Double specPricePerHour;
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
        private Double modelPricePerHour;
    }

    // 조합된 가격 정보를 위한 새 클래스
    @Getter
    @AllArgsConstructor
    @Builder
    public static class CombinedPriceInfoDto {
        private Long modelId;
        private Long specId;
        private Double totalPricePerHour; // 두 가격의 합
    }
}