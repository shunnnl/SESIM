package com.backend.sesim.domain.user.controller;

import com.backend.sesim.domain.user.service.UserService;
import com.backend.sesim.facade.user.dto.request.UserDeleteRequest;
import com.backend.sesim.facade.user.dto.response.CurrentUserResponse;
import com.backend.sesim.global.dto.CommonResponseDto;
import com.backend.sesim.global.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
@Tag(name = "사용자 관리 컨트롤러", description = "사용자 정보를 관리하는 컨트롤러")
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @DeleteMapping("/delete")
    @Operation(summary = "회원 탈퇴", description = "현재 비밀번호 확인 후 회원 탈퇴를 진행합니다.")
    public CommonResponseDto deleteUser(@RequestBody UserDeleteRequest request) {
        Long userId = securityUtils.getCurrentUsersId();
        userService.deleteUser(request, userId);
        return CommonResponseDto.ok();
    }

    @GetMapping("/me")
    @Operation(summary = "내 정보 상세 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    public CommonResponseDto<CurrentUserResponse> getCurrentUser() {
        Long userId = securityUtils.getCurrentUsersId();
        CurrentUserResponse userInfo = userService.getCurrentUserInfo(userId);
        return CommonResponseDto.ok(userInfo);
    }
}