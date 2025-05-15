package com.backend.sesim.domain.deployment.controller;

import com.backend.sesim.domain.deployment.dto.request.ApiKeyCheckRequest;
import com.backend.sesim.domain.deployment.dto.request.ApiUsageIntervalRequest;
import com.backend.sesim.domain.deployment.dto.request.ApiUsageUpdateRequest;
import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.dto.response.*;
import com.backend.sesim.domain.deployment.service.*;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/deployment")
@RequiredArgsConstructor
@Tag(name = "프로젝트 및 배포 관리 컨트롤러", description = "사용자 프로젝트 조회 및 AWS 리소스 배포 기능을 제공하는 통합 컨트롤러")
@Slf4j
public class DeploymentController {

    private final TerraformService terraformDeployService;
    private final DeploymentOptionService deployService;
    private final ProjectService projectService;
    private final DeploymentStepSSEService deploymentStepSSEService;
    private final ApiUsageService apiUsageService;
    private final ApiUsageSSEService apiUsageSSEService;

    @Operation(summary = "SaaS 계정에 리소스 배포", description = "SaaS 계정에 AWS 리소스를 배포합니다.")
    @PostMapping("/terraform")
    public CommonResponseDto deploy(@RequestBody TerraformDeployRequest request) {
        terraformDeployService.deployToSaasAccount(request);
        return CommonResponseDto.ok();
    }

    @Operation(summary = "배포 옵션 조회", description = "배포에 필요한 모든 옵션(리전, 인프라 스펙, 모델)을 한 번에 조회합니다.")
    @GetMapping("/options")
    public CommonResponseDto<DeployOptionsResponse> getDeployOptions() {
        return CommonResponseDto.ok(deployService.getDeployOptions());
    }

    @Operation(summary = "API 키 확인", description = "배포된 모델의 API 키를 확인하고 반환합니다.")
    @PostMapping("/apikey")
    public CommonResponseDto<ApiKeyResponse> checkApiKey(@RequestBody ApiKeyCheckRequest request) {
        ApiKeyResponse response = projectService.checkAndGetApiKey(request);
        return CommonResponseDto.ok(response);
    }

    @Operation(summary = "프로젝트 및 모델의 Alb 주소, granfanaUrl, 허용된 ip 조회 및 배포 상태 실시간 모니터링", description = "모든 프로젝트의 Alb 주소, granfanaUrl, 허용된 ip 및 배포 상태를 실시간으로 모니터링하는 SSE 스트림을 제공합니다.")
    @GetMapping(value = "/status/stream", produces = "text/event-stream")
    public SseEmitter streamDeploymentStatus() {
        return deploymentStepSSEService.subscribe();
    }

    @Operation(summary = "API 사용량 업데이트", description = "API 사용량 정보를 업데이트합니다.")
    @PostMapping("/api-usage")
    public CommonResponseDto<?> updateApiUsage(@RequestBody ApiUsageUpdateRequest request) {
        apiUsageService.updateApiUsage(request);
        return CommonResponseDto.ok();
    }

    @Operation(summary = "API 사용량 실시간 모니터링", description = "API 사용량을 실시간으로 모니터링하는 SSE 스트림을 제공합니다.")
    @GetMapping(value = "/api-usage/stream", produces = "text/event-stream")
    public SseEmitter streamApiUsage() {
        return apiUsageSSEService.subscribe();
    }

    @Operation(summary = "API 사용량 특정 기간 조회", description = "API 사용량을 시작시간과 마지막 시간까지에 대한 일자별/월별 정보를 제공합니다.")
    @GetMapping(value = "/api-usage/interval")
    public CommonResponseDto<ApiUsageIntervalResponse> getIntervalApiUsage(ApiUsageIntervalRequest request) {
        ApiUsageIntervalResponse response = apiUsageService.getIntervalApiUsage(request);
        return CommonResponseDto.ok(response);
    }

    @Operation(summary = "특정 프로젝트 + 특정 월 사용량 요약", description = "특정 프로젝트의 지정된 월에 대한 API 호출 수, 비용, 사용 시간 등 요약 정보를 제공합니다.")
    @GetMapping("/api-usage/interval/specific/specific")
    public CommonResponseDto<ApiUsageIntervalSpecificSpecificResponse> getProjectMonthly(
        @ModelAttribute ApiUsageIntervalRequest request) {
        return CommonResponseDto.ok(apiUsageService.getIntervalSpecificSpecificApiUsage(request));
    }

    @Operation(summary = "전체 프로젝트 + 특정 월 사용량 요약", description = "현재 계정의 모든 프로젝트의 지정된 월에 대한 총 요청 수, 비용 등을 제공합니다.")
    @GetMapping("/api-usage/interval/all/specific")
    public CommonResponseDto<ApiUsageIntervalAllSpecificResponse> getAllProjectsMonthly(
        @ModelAttribute ApiUsageIntervalRequest request) {
        return CommonResponseDto.ok(apiUsageService.getIntervalAllSpecificApiUsage(request));
    }

    @Operation(summary = "특정 프로젝트 + 전체 기간 요약", description = "특정 프로젝트에 대한 전체 기간 사용량 및 최근 3개월간 모델별 비용, 요청 수, 사용시간 등의 상세 정보를 반환합니다.")
    @GetMapping("/api-usage/interval/specific/all")
    public CommonResponseDto<ApiUsageIntervalSpecificAllResponse> getProjectAllPeriod(
        @ModelAttribute ApiUsageIntervalRequest request) {
        return CommonResponseDto.ok(apiUsageService.getIntervalSpecificAllApiUsage(request));
    }

    @Operation(summary = "전체 프로젝트 + 전체 기간 요약", description = "계정 내 모든 프로젝트의 전체 기간 누적 사용량 및 최근 3개월 간 프로젝트별 요약, 일자별 상세 비용을 제공합니다.")
    @GetMapping("/api-usage/interval/all/all")
    public CommonResponseDto<ApiUsageIntervalAllAllResponse> getAllProjectsAllPeriod(
        @ModelAttribute ApiUsageIntervalRequest request) {
        return CommonResponseDto.ok(apiUsageService.getIntervalAllAllApiUsage(request));
    }
}