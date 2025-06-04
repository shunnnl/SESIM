package com.backend.sesim.domain.deployment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKeyCheckRequest {
    private Long projectId;
    private Long modelId;
}