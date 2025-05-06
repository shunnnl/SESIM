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

    @Column(name = "description")
    private String description;

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "framework", nullable = false)
    private String framework;

    @Column(name = "model_price_per_hour", nullable = false, columnDefinition = "DOUBLE DEFAULT 0.0")
    private Double modelPricePerHour;
}