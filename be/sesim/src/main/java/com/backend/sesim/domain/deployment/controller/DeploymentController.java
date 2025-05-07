package com.backend.sesim.domain.deployment.controller;

import com.backend.sesim.domain.deployment.dto.request.ApiKeyCheckRequest;
import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.dto.response.*;
import com.backend.sesim.domain.deployment.service.DeploymentOptionService;
import com.backend.sesim.domain.deployment.service.ProjectService;
import com.backend.sesim.domain.deployment.service.TerraformService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deployment")
@RequiredArgsConstructor
@Tag(name = "프로젝트 및 배포 관리 컨트롤러", description = "사용자 프로젝트 조회 및 AWS 리소스 배포 기능을 제공하는 통합 컨트롤러")
@Slf4j
public class DeploymentController {

    private final TerraformService terraformDeployService;
    private final DeploymentOptionService deployService;
    private final ProjectService projectService;

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

    @Operation(summary = "사용자 프로젝트 목록 조회", description = "현재 로그인한 사용자의 프로젝트 목록과 관련 모델 정보를 조회합니다.")
    @GetMapping("/projects")
    public CommonResponseDto<ProjectListResponse> getUserProjects() {
        return CommonResponseDto.ok(projectService.getUserProjects());
    }

    @Operation(summary = "프로젝트 배포 상태 조회", description = "현재 로그인한 사용자의 프로젝트 및 모델 배포 상태를 조회합니다.")
    @GetMapping("/status")
    public CommonResponseDto<ProjectDeploymentStatusResponse> getProjectDeploymentStatus() {
        ProjectDeploymentStatusResponse response = projectService.getProjectDeploymentStatus();
        return CommonResponseDto.ok(response);
    }

    @Operation(summary = "API 키 확인", description = "배포된 모델의 API 키를 확인하고 반환합니다.")
    @PostMapping("/apikey")
    public CommonResponseDto<ApiKeyResponse> checkApiKey(@RequestBody ApiKeyCheckRequest request) {
        log.info("API 키 확인 요청: projectId={}, modelId={}", request.getProjectId(), request.getModelId());
        ApiKeyResponse response = projectService.checkAndGetApiKey(request);
        return CommonResponseDto.ok(response);
    }

    @Operation(summary = "사용자 전체 API 사용량 조회", description = "현재 로그인한 사용자의 모든 프로젝트 API 사용량을 조회합니다.")
    @GetMapping("/projects/usage")
    public CommonResponseDto<ApiUsageResponse> getAllUserProjectsApiUsage() {
        log.info("사용자 전체 API 사용량 조회 요청");
        ApiUsageResponse response = projectService.getAllUserProjectsApiUsage();
        return CommonResponseDto.ok(response);
    }
}