package com.backend.sesim.domain.deployment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "register_ips")
@Getter
@NoArgsConstructor
public class RegisterIp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "register_ip_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "ip_number", nullable = false, length = 20)
    private String ipNumber;

    @Builder
    public RegisterIp(Project project, String ipNumber) {
        this.project = project;
        this.ipNumber = ipNumber;
    }
}