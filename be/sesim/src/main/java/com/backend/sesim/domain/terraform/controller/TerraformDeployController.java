package com.backend.sesim.domain.terraform.controller;

import com.backend.sesim.domain.terraform.dto.request.DeployRequest;
import com.backend.sesim.domain.terraform.service.TerraformDeployService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/terraform")
@RequiredArgsConstructor
@Tag(name = "테라폼 컨트롤러", description = "AWS 리소스 배포를 위한 테라폼 관련 기능을 제공하는 컨트롤러")
@Slf4j
public class TerraformDeployController {

    private final TerraformDeployService terraformDeployService;

    @Operation(summary = "리소스 배포", description = "테라폼을 사용하여 고객 계정에 AWS 리소스를 배포합니다.")
    @PostMapping("/deploy")
    public CommonResponseDto deploy(@RequestBody DeployRequest request) {
        log.info("배포 요청 시작: {}", request.getDeploymentId());
        terraformDeployService.deployToCustomerAccount(request);
        return CommonResponseDto.ok();
    }
}