package com.backend.sesim.domain.infrastructure.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "infrastructure_specs")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfrastructureSpec {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "spec_id")
    private Long id;

    @Column(name = "ec2_spec", nullable = false)
    private String ec2Spec;

    @Column(name = "ec2_info", nullable = false)
    private String ec2Info;
}