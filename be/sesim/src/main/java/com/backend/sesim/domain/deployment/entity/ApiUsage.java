package com.backend.sesim.domain.deployment.entity;

import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "api_usage")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsage extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "api_usage_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "information_id", nullable = false)
    private ProjectModelInformation information;

    @Column(name = "api_name", nullable = false, length = 100)
    private String apiName;

    @Column(name = "total_request_count", nullable = false)
    private int totalRequestCount;

    @Column(name = "total_seconds", nullable = false)
    private int totalSeconds;
}