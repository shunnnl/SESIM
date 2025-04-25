package com.backend.sesim.domain.auth.service;


import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.user.entity.Users;
import com.backend.sesim.domain.user.repository.UsersRepository;
import com.backend.sesim.facade.auth.dto.request.LoginRequest;
import com.backend.sesim.facade.auth.dto.request.LoginResponse;
import com.backend.sesim.facade.auth.dto.request.SignUpRequest;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.security.dto.Token;
import com.backend.sesim.global.security.jwt.JwtTokenProvider;
import io.jsonwebtoken.Jwt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public void signUp(SignUpRequest request) {
        //1. 에러 검증
        validateSignupRequest(request);

        //2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        //3. User 엔터티 생성
        Users users = Users.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .nickname(request.getNickname())
                .build();

        //4. db에 저장
        usersRepository.save(users);

        log.info("회원가입 완료");
    }

    public LoginResponse login(LoginRequest request) {
        //1. 사용자 검증
        Users users = validateLoginRequest(request);

        //2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), users.getPassword())) {
            log.warn("비밀번호 불일치", users.getPassword());
            throw new GlobalException(AuthErrorCode.INVALID_PASSWORD);
        }

        log.info("로그인 성공", users.getEmail());

        // 3. JWT 토큰 생성
        Token token = jwtTokenProvider.generateToken(users);

        return LoginResponse.builder()
                .id(users.getId())
                .email(users.getEmail())
                .nickname(users.getNickname())
                .token(token)
                .createdAt(users.getCreatedAt())
                .deletedAt(users.getDeletedAt())
                .build();
    }


    private void validateSignupRequest(SignUpRequest request) {
        // 이메일과 일치하면서 탈퇴하지 않은 사용자가 있는지 확인
        boolean hasActiveUser = usersRepository.existsByEmailAndDeletedAtIsNull(request.getEmail());

        if (hasActiveUser) {
            throw new GlobalException(AuthErrorCode.EMAIL_ALREADY_EXISTS);
        }
        // 활성 사용자가 없으면 회원가입 가능 (새 이메일이거나 탈퇴한 사용자의 이메일)
    }

    // 로그인 검증 메서드
    private Users validateLoginRequest(LoginRequest request) {
        // 이메일로 사용자 조회
        Users user = usersRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new GlobalException(AuthErrorCode.EMAIL_NOT_FOUND));

        // 탈퇴 여부 확인
        if (user.getDeletedAt() != null) {
            throw new GlobalException(AuthErrorCode.USER_DELETED);
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("비밀번호 불일치: {}", user.getEmail());
            throw new GlobalException(AuthErrorCode.INVALID_PASSWORD);
        }

        log.info("로그인 성공: {}", user.getEmail());
        return user;
    }

}
