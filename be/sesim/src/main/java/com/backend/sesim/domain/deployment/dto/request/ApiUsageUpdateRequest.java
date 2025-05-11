package com.backend.sesim.domain.deployment.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiUsageUpdateRequest {

    @Schema(description = "프로젝트 모델 정보 ID")
    private Long informationId;

    @Schema(description = "API 엔드포인트 이름")
    private String apiName;

    @Schema(description = "요청 횟수")
    private int requestCount;

    @Schema(description = "처리 시간(초)")
    private int seconds;
}