package com.backend.sesim.domain.user.entity;

import com.amazonaws.arn.Arn;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Builder
@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "user")
    private List<RoleArn> roleArns = new ArrayList<>();

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    // 사용자 탈퇴 메서드
    public void delete() {
        this.deletedAt = LocalDateTime.now();
    }

    // 탈퇴 여부 확인 메서드
    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
