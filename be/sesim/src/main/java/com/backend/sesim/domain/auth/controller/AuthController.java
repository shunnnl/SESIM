package com.backend.sesim.domain.auth.controller;

import com.backend.sesim.domain.auth.dto.request.LoginRequest;
import com.backend.sesim.domain.auth.dto.request.LoginResponse;
import com.backend.sesim.domain.auth.dto.request.RefreshTokenRequest;
import com.backend.sesim.domain.auth.dto.request.SignUpRequest;
import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.auth.service.AuthService;
import com.backend.sesim.global.dto.CommonResponseDto;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.security.dto.Token;
import com.backend.sesim.global.security.jwt.JwtTokenProvider;
import com.backend.sesim.global.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SignatureException;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "회원 컨트롤러", description = "로그인, 회원가입, 사용자 인증토큰 발급 등 회원정보를 관리하는 컨트롤러")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "회원가입", description = "회원가입을 처리합니다.")
    @PostMapping("/signup")
    public CommonResponseDto signUp(@RequestBody SignUpRequest request) {
        authService.signUp(request);
        return CommonResponseDto.ok();
    }


    @PostMapping("/login")
    @Operation(summary = "로그인", description = "사용자 인증 후 JWT 토큰을 발급합니다. Refresh Token은 HTTP-Only 쿠키로 전송됩니다.")
    public CommonResponseDto<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request, response);
        return CommonResponseDto.ok(loginResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "사용자의 토큰을 무효화하고 Refresh Token 쿠키를 삭제합니다.")
    public CommonResponseDto<?> logout(HttpServletResponse response) {
        // SecurityUtils를 사용하여 현재 인증된 사용자의 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        // 인증된 사용자가 없는 경우 예외 처리
        if (userId == null) {
            throw new GlobalException(AuthErrorCode.UNAUTHORIZED_USER);
        }

        authService.logout(userId, response);
        return CommonResponseDto.ok();
    }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신", description = "Refresh Token 쿠키를 사용하여 새 Access Token을 발급받습니다.")
    public CommonResponseDto<Token> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        Token newToken = authService.refreshToken(request, response);
        return CommonResponseDto.ok(newToken);
    }
}
