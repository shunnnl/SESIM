package com.backend.sesim.domain.deployment.dto.response;

import com.backend.sesim.domain.deployment.dto.StepStatusDto;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DeploymentStepsResponse {
    private Long projectId;
    private String projectName;
    private String overallStatus;
    private List<StepStatusDto> steps;
    private Integer currentStepOrder;
}