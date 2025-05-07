package com.backend.sesim.domain.iam.entity;

import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.global.entity.TimeStampEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "arns")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleArn extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "arn_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "role_arn", nullable = false)
    private String roleArn;

    @OneToMany(mappedBy = "roleArn")
    private List<Project> projects = new ArrayList<>();
}