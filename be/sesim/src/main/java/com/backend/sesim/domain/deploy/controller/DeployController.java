package com.backend.sesim.domain.deploy.controller;

import com.backend.sesim.domain.deploy.dto.response.DeployOptionsResponse;
import com.backend.sesim.domain.deploy.service.DeployService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deploy")
@RequiredArgsConstructor
@Tag(name = "배포 컨트롤러", description = "배포 관련 정보를 관리하는 컨트롤러")
@Slf4j
public class DeployController {

    private final DeployService deployService;

    @Operation(summary = "배포 옵션 조회", description = "배포에 필요한 모든 옵션(리전, 인프라 스펙, 모델)을 한 번에 조회합니다.")
    @GetMapping("/options")
    public CommonResponseDto<DeployOptionsResponse> getDeployOptions() {
        return CommonResponseDto.ok(deployService.getDeployOptions());
    }
}