package com.backend.sesim.domain.user.service;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.exception.UserErrorCode;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.facade.user.dto.request.UserDeleteRequest;
import com.backend.sesim.facade.user.dto.response.CurrentUserResponse;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원 탈퇴 (논리적 삭제)
     */
    @Transactional
    public void deleteUser(UserDeleteRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 이미 탈퇴한 회원인지 확인
        if (user.isDeleted()) {
            throw new GlobalException(UserErrorCode.ALREADY_DELETED_USER);
        }

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new GlobalException(UserErrorCode.PASSWORD_MISMATCH);
        }

        user.updateRefreshToken(null); // 리프레쉬토큰 null로 처리

        // 사용자 삭제 처리 (deletedAt 필드에 현재 시간 설정)
        user.delete();

        // 변경사항 저장
        userRepository.save(user);
    }


    /**
     * 현재 로그인한 사용자 정보 조회
     */
    @Transactional
    public CurrentUserResponse getCurrentUserInfo(Long userId) {
        // 1. 사용자 기본 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 2. 사용자 정보 조회
        return CurrentUserResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .build();
    }
}