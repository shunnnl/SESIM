package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.iam.entity.RoleArn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByRoleArnIn(List<RoleArn> roleArns);
    @Query("SELECT p FROM Project p JOIN FETCH p.roleArn r JOIN FETCH r.user WHERE p.id = :projectId")
    Optional<Project> findProjectWithRoleArnById(@Param("projectId") Long projectId);
}