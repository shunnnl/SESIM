package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.RegisterIp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegisterIpRepository extends JpaRepository<RegisterIp, Long> {
    /**
     * 프로젝트 ID로 등록된 IP 목록 조회
     */
    List<RegisterIp> findByProjectId(Long projectId);
}