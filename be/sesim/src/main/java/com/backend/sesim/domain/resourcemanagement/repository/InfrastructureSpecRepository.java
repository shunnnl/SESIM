package com.backend.sesim.domain.resourcemanagement.repository;

import com.backend.sesim.domain.resourcemanagement.entity.InfrastructureSpec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InfrastructureSpecRepository extends JpaRepository<InfrastructureSpec, Long> {
}