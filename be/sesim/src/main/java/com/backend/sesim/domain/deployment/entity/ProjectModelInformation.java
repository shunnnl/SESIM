package com.backend.sesim.domain.deployment.entity;

import com.backend.sesim.domain.resourcemanagement.entity.InfrastructureSpec;
import com.backend.sesim.domain.resourcemanagement.entity.Region;
import com.backend.sesim.domain.resourcemanagement.entity.Model;
import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "informations")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectModelInformation extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "information_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private Model model;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spec_id", nullable = false)
    private InfrastructureSpec spec;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(name = "model_api_key", length = 255)
    private String modelApiKey;

    @Builder.Default
    @Column(name = "is_api_key_check")
    private Boolean isApiKeyCheck = false;

    // API 키 확인 메서드
    public void checkModelApiKey(String apiKey) {
        this.isApiKeyCheck=true;
    }

}