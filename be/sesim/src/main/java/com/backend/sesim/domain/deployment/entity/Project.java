package com.backend.sesim.domain.deployment.entity;

import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "projects")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arn_id", nullable = false)
    private RoleArn roleArn;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "alb_address", length = 255)
    private String albAddress;

    @OneToMany(mappedBy = "project")
    private List<ProjectModelInformation> modelInformations = new ArrayList<>();

    // ALB 주소 업데이트 메서드
    public void updateAlbAddress(String albAddress) {
        this.albAddress = albAddress;
    }
}