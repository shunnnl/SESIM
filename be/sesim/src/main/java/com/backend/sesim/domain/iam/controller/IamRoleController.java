package com.backend.sesim.domain.iam.controller;

import com.backend.sesim.domain.iam.dto.request.AssumeRoleRequest;
import com.backend.sesim.domain.iam.dto.response.RoleVerificationResponse;
import com.backend.sesim.domain.iam.service.IamRoleService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/iam")
@RequiredArgsConstructor
@Tag(name = "IAM 역할 컨트롤러", description = "AWS IAM 역할 검증을 관리하는 컨트롤러")
@Slf4j
public class IamRoleController {

    private final IamRoleService iamRoleService;

    @Operation(summary = "역할 검증", description = "AWS IAM 역할(Role) 검증을 처리합니다.")
    @PostMapping("/verify-role")
    public CommonResponseDto<RoleVerificationResponse> verifyAssumeRole(@RequestBody AssumeRoleRequest request) {
        log.info("역할 검증 요청: {}", request.getRoleArn());
        return CommonResponseDto.ok(iamRoleService.verifyAssumeRole(request.getRoleArn()));
    }
}