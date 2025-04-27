package com.backend.sesim.domain.user.repository;

import com.backend.sesim.domain.user.entity.Users;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findById(Long id);

    // 이메일로 사용자 조회
    Optional<Users> findByEmail(String email);

    // 탈퇴하지 않은 사용자 존재 여부 확인
    boolean existsByEmailAndDeletedAtIsNull(String email);
}
