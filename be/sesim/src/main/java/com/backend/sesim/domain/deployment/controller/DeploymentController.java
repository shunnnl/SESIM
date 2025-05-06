package com.backend.sesim.domain.deployment.controller;

import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.dto.response.DeployOptionsResponse;
import com.backend.sesim.domain.deployment.dto.response.DeployResultResponse;
import com.backend.sesim.domain.deployment.service.DeploymentOptionService;
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
@Tag(name = "배포 컨트롤러", description = "AWS 리소스 배포 및 배포 옵션 조회 기능을 제공하는 통합 컨트롤러")
@Slf4j
public class DeploymentController {

    private final TerraformService terraformDeployService;
    private final DeploymentOptionService deployService;

    @Operation(summary = "SaaS 계정에 리소스 배포", description = "SaaS 계정에 AWS 리소스를 배포합니다.")
    @PostMapping("/terraform")
    public CommonResponseDto<DeployResultResponse> deploy(@RequestBody TerraformDeployRequest request) {
        log.info("배포 요청 시작: {}", request.getDeploymentId());
        DeployResultResponse result = terraformDeployService.deployToSaasAccount(request);
        return CommonResponseDto.ok(result);
    }

    @Operation(summary = "배포 옵션 조회", description = "배포에 필요한 모든 옵션(리전, 인프라 스펙, 모델)을 한 번에 조회합니다.")
    @GetMapping("/options")
    public CommonResponseDto<DeployOptionsResponse> getDeployOptions() {
        return CommonResponseDto.ok(deployService.getDeployOptions());
    }
}