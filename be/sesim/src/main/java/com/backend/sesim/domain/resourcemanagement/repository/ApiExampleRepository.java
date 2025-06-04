package com.backend.sesim.domain.resourcemanagement.repository;

import com.backend.sesim.domain.resourcemanagement.entity.ApiExample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApiExampleRepository extends JpaRepository<ApiExample, Long> {
    // 가장 최신의 API 예제 코드를 가져오는 메서드
    ApiExample findFirstByOrderByIdDesc();
}