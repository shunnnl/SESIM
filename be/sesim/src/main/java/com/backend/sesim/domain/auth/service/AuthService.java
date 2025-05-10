package com.backend.sesim.domain.auth.service;

import com.backend.sesim.domain.auth.dto.request.LoginResponse;
import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.domain.auth.dto.request.LoginRequest;
import com.backend.sesim.domain.auth.dto.request.SignUpRequest;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.security.dto.Token;
import com.backend.sesim.global.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public void signUp(SignUpRequest request) {
        // 기존 코드 유지
        validateSignupRequest(request);
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User users = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .build();
        usersRepository.save(users);
        log.info("회원가입 완료");
    }

    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        // 사용자 검증
        User users = validateLoginRequest(request);

        // JWT 토큰 생성 (Refresh Token은 쿠키로 설정됨)
        Token token = jwtTokenProvider.generateToken(users, response);

        return LoginResponse.builder()
                .id(users.getId())
                .email(users.getEmail())
                .nickname(users.getNickname())
                .token(token) // Refresh Token은 null이고 쿠키로 전송됨
                .createdAt(users.getCreatedAt())
                .deletedAt(users.getDeletedAt())
                .build();
    }

    public void logout(Long id, HttpServletResponse response) {
        User users = usersRepository.findById(id)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // DB에서 Refresh Token 제거
        invalidateRefreshToken(users);

        // 쿠키에서 Refresh Token 제거
        jwtTokenProvider.deleteRefreshTokenCookie(response);

        log.info("로그아웃 완료: {}", users.getEmail());
    }

    public Token refreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            // JwtTokenProvider를 통해 쿠키에서 Refresh Token 추출 및 검증
            Token newToken = jwtTokenProvider.refreshAccessToken(request, response);
            return newToken;
        } catch (Exception e) {
            log.error("토큰 갱신 실패: {}", e.getMessage());
            throw new GlobalException(AuthErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

    private void validateSignupRequest(SignUpRequest request) {
        // 기존 코드 유지
        boolean hasActiveUser = usersRepository.existsByEmailAndDeletedAtIsNull(request.getEmail());
        if (hasActiveUser) {
            throw new GlobalException(AuthErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    private User validateLoginRequest(LoginRequest request) {
        // 이메일로 활성 사용자만 조회
        User user = usersRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .orElseThrow(() -> {
                    // 사용자가 없는 경우, 탈퇴한 사용자인지 확인
                    if (usersRepository.findAllByEmail(request.getEmail()).isEmpty()) {
                        return new GlobalException(AuthErrorCode.EMAIL_NOT_FOUND);
                    } else {
                        return new GlobalException(AuthErrorCode.USER_DELETED);
                    }
                });

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("비밀번호 불일치: {}", user.getEmail());
            throw new GlobalException(AuthErrorCode.INVALID_PASSWORD);
        }

        log.info("로그인 성공: {}", user.getEmail());
        return user;
    }

    private void invalidateRefreshToken(User users) {
        users.updateRefreshToken(null);
        usersRepository.save(users);
    }
}