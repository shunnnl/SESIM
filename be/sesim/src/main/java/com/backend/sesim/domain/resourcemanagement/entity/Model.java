package com.backend.sesim.domain.resourcemanagement.entity;

import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "models")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Model extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "short_description")
    private String shortDescription; // 간단한 설명

    @Column(name = "feature_summary", nullable = false)
    private String featureSummary; // 특징 제목/요약 (예: "비정상적인 URL 접근 탐지")

    @Column(name = "feature_overview", nullable = false)
    private String featureOverview; // 특징 개요 (예: "웹쉘 업로드 시도 감지")

    @Column(name = "feature_detail", nullable = false)
    private String featureDetail; // 특징 상세 설명 (예: "SQL 인젝션 시도 식별")

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "framework", nullable = false)
    private String framework;

    @Column(name = "model_price_per_hour", nullable = false, columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double modelPricePerHour;
}