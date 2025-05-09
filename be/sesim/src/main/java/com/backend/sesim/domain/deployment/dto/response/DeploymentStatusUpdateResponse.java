package com.backend.sesim.domain.deployment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentStatusUpdateResponse {
    private Long projectId;
    private ProjectStatusResponse projectStatus;
    private Long stepId;
    private String stepName;
    private String stepStatus;
}