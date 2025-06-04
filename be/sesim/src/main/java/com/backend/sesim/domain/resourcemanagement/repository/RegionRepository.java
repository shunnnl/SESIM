package com.backend.sesim.domain.resourcemanagement.repository;

import com.backend.sesim.domain.resourcemanagement.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {
}