package com.backend.sesim.domain.deployment.repository;

import com.backend.sesim.domain.deployment.entity.ApiUsage;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
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

    // 비관적 락을 적용한 새 메서드 추가
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM ApiUsage a " +
        "WHERE a.information.id = :informationId " +
        "AND a.apiName = :apiName " +
        "AND a.intervalDate = :intervalDate")
    Optional<ApiUsage> findByInfoIdAndApiNameAndIntervalDateWithLock(
        @Param("informationId") Long informationId,
        @Param("apiName") String apiName,
        @Param("intervalDate") Date intervalDate);

    @Query("SELECT a FROM ApiUsage a WHERE a.information.id = :infoId AND a.intervalDate BETWEEN :start AND :end")
    List<ApiUsage> findByInfoIdAndIntervalDateBetween(@Param("infoId") Long infoId,
        @Param("start") Date start,
        @Param("end") Date end);

}