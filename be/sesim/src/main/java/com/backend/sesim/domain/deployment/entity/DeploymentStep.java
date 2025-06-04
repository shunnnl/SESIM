package com.backend.sesim.domain.deployment.entity;

import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "steps")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeploymentStep extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "step_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "step_name", nullable = false, length = 50)
    private String stepName;

    @Column(name = "step_status", length = 50)
    private String stepStatus; // ENUM("PENDING", "DEPLOYING", "DEPLOYED", "FAILED")

    // 상태 업데이트 메서드
    public void updateStatus(String status) {
        this.stepStatus = status;
    }
}