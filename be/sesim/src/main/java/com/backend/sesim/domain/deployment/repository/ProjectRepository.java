package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.iam.entity.RoleArn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByRoleArnIn(List<RoleArn> roleArns);
}