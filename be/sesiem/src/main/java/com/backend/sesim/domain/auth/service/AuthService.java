package com.backend.sesim.domain.auth.service;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.facade.auth.dto.request.LoginRequest;
import com.backend.sesim.facade.auth.dto.request.LoginResponse;
import com.backend.sesim.facade.auth.dto.request.SignUpRequest;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.security.dto.Token;
import com.backend.sesim.global.security.jwt.JwtTokenProvider;
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
        //1. 에러 검증
        validateSignupRequest(request);

        //2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        //3. User 엔터티 생성
        User users = User.builder()
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
        User users = validateLoginRequest(request);

        // 2. JWT 토큰 생성
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

    public void logout(Long id) {
        User users = usersRepository.findById(id)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        invalidateRefreshToken(users);
        log.info("로그아웃 완료", users.getEmail());
    }

    private void validateSignupRequest(SignUpRequest request) {
        // 이메일과 일치하면서 탈퇴하지 않은 사용자가 있는지 확인
        boolean hasActiveUser = usersRepository.existsByEmailAndDeletedAtIsNull(request.getEmail());

        if (hasActiveUser) {
            throw new GlobalException(AuthErrorCode.EMAIL_ALREADY_EXISTS);
        }
        // 활성 사용자가 없으면 회원가입 가능 (새 이메일이거나 탈퇴한 사용자의 이메일)
    }

    private User validateLoginRequest(LoginRequest request) {
        // 이메일로 사용자 조회
        User user = usersRepository.findByEmail(request.getEmail())
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

    private void invalidateRefreshToken(User users) {
        // 사용자의 리프레시 토큰 필드를 null로 설정
        users.updateRefreshToken(null);
        usersRepository.save(users);
    }
}
