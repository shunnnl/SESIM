package com.backend.sesim.domain.deployment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiUsageUpdateRequest {

    private Long projectId;

    private Long modelId;

    private String apiName;

    private int totalRequestCount;

    private int totalSeconds;
}