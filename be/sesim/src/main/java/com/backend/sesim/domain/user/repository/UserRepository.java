package com.backend.sesim.domain.user.repository;

import com.backend.sesim.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findById(Long id);
    
    // 활성 사용자만 이메일로 조회
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    // 모든 사용자를 이메일로 조회
    List<User> findAllByEmail(String email);

    // 탈퇴하지 않은 사용자 존재 여부 확인
    boolean existsByEmailAndDeletedAtIsNull(String email);
}
