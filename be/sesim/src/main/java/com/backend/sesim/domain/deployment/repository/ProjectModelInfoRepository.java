package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectModelInfoRepository extends JpaRepository<ProjectModelInformation, Long> {
    Optional<ProjectModelInformation> findByProjectIdAndModelId(Long projectId, Long modelId);
    List<ProjectModelInformation> findByProjectId(Long projectId);
    @Query("SELECT pmi FROM ProjectModelInformation pmi JOIN FETCH pmi.model WHERE pmi.id IN :ids")
    List<ProjectModelInformation> findAllWithModelByIdIn(List<Long> ids);
}