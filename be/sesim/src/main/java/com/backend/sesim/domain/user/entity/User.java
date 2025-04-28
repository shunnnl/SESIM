package com.backend.sesim.domain.user.entity;

import com.backend.sesim.global.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
