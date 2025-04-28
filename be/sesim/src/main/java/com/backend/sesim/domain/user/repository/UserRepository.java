package com.backend.sesim.domain.user.repository;

import com.backend.sesim.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findById(Long id);

    // 이메일로 사용자 조회
    Optional<User> findByEmail(String email);

    // 탈퇴하지 않은 사용자 존재 여부 확인
    boolean existsByEmailAndDeletedAtIsNull(String email);
}
