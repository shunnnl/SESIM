package com.backend.sesim.domain.iam.controller;

import com.backend.sesim.domain.iam.dto.request.AssumeRoleRequest;
import com.backend.sesim.domain.iam.dto.response.ArnResponse;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.domain.iam.service.IamRoleService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/iam")
@RequiredArgsConstructor
@Tag(name = "IAM 역할 컨트롤러", description = "AWS IAM 역할 검증을 관리하는 컨트롤러")
@Slf4j
public class IamRoleController {

    private final IamRoleService iamRoleService;

    @Operation(summary = "역할 검증", description = "AWS IAM 역할(Role) 검증을 처리합니다.")
    @PostMapping("/verify-role")
    public CommonResponseDto<ArnResponse> verifyAssumeRole(@RequestBody AssumeRoleRequest request) {
        log.info("역할 검증 요청: {}", request.getRoleArn());
        return CommonResponseDto.ok(iamRoleService.verifyAssumeRole(request.getRoleArn()));
    }

    @Operation(summary = "내 ARN 목록 조회", description = "로그인한 사용자의 ARN 목록을 조회합니다.")
    @GetMapping("/my-arns")
    public CommonResponseDto<List<ArnResponse>> getMyArns() {
        log.info("사용자 ARN 목록 조회 요청");
        List<RoleArn> arns = iamRoleService.getUserArns();
        List<ArnResponse> responses = arns.stream()
                .map(arn -> new ArnResponse(arn.getId(), arn.getRoleArn()))
                .collect(Collectors.toList());
        return CommonResponseDto.ok(responses);
    }
}