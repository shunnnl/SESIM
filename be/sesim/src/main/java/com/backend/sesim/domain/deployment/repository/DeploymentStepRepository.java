package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeploymentStepRepository extends JpaRepository<DeploymentStep, Long> {
    List<DeploymentStep> findByProjectIdOrderByStepOrder(Long projectId);
    Optional<DeploymentStep> findByProjectIdAndStepName(Long projectId, String stepName);
}