package com.backend.sesim.domain.iam.repository;

import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.iam.entity.RoleArn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface RoleArnRepository extends JpaRepository<RoleArn, Long> {
    List<RoleArn> findAllByUser(User user);

    boolean existsByRoleArnAndUser(String roleArn, User user);
}