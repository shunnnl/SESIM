package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.ApiUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiUsageRepository extends JpaRepository<ApiUsage, Long> {

    // 모델 정보 ID와 API 이름으로 사용량 조회
    Optional<ApiUsage> findByInformationIdAndApiName(Long informationId, String apiName);

    // Integer 대신 int로 바꾸고 기본값 0을 반환하도록 수정
    @Query("SELECT COALESCE(SUM(a.totalRequestCount), 0) FROM ApiUsage a WHERE a.information.id = :informationId")
    int sumTotalRequestCountByInformationId(@Param("informationId") Long informationId);

    @Query("SELECT COALESCE(SUM(a.totalSeconds), 0) FROM ApiUsage a WHERE a.information.id = :informationId")
    int sumTotalSecondsByInformationId(@Param("informationId") Long informationId);
}