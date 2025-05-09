package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.ApiUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiUsageRepository extends JpaRepository<ApiUsage, Long> {

    // Integer 대신 int로 바꾸고 기본값 0을 반환하도록 수정
    @Query("SELECT COALESCE(SUM(a.totalRequestCount), 0) FROM ApiUsage a WHERE a.information.id = :informationId")
    int sumTotalRequestCountByInformationId(@Param("informationId") Long informationId);

    @Query("SELECT COALESCE(SUM(a.totalSeconds), 0) FROM ApiUsage a WHERE a.information.id = :informationId")
    int sumTotalSecondsByInformationId(@Param("informationId") Long informationId);
}