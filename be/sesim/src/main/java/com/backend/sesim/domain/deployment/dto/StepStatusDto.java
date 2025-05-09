package com.backend.sesim.domain.deployment.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StepStatusDto {
    private Long stepId;
    private Integer stepOrder;
    private String stepName;
    private String displayName;
    private String description;
    private String stepStatus;
}