package com.backend.sesim.domain.resourcemanagement.entity;

import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "api_examples")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiExample extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "example_id")
    private Long id;

    @Column(name = "code_example", nullable = false, columnDefinition = "TEXT")
    private String codeExample; // API 호출 예제 코드
}