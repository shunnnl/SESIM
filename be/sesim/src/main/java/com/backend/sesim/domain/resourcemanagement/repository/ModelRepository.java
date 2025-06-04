package com.backend.sesim.domain.resourcemanagement.repository;

import com.backend.sesim.domain.resourcemanagement.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
}