package com.backend.sesim.domain.resourcemanagement.entity;

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

    @Column(name = "spec_price_per_hour", nullable = false, columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double specPricePerHour;
}