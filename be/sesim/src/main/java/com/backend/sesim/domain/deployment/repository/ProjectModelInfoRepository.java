package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectModelInfoRepository extends JpaRepository<ProjectModelInformation, Long> {
}