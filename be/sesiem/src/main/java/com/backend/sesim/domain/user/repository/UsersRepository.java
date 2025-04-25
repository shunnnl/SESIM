package com.backend.sesim.domain.user.repository;

import com.backend.sesim.domain.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findById(Long id);
}
