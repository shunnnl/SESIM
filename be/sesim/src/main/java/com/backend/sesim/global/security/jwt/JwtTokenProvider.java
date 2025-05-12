package com.backend.sesim.global.security.jwt;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.security.dto.Token;
import com.backend.sesim.global.security.exception.JwtErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.SignatureException;
import java.time.LocalDateTime;
import java.util.Date;

//JWT 토큰 생성, 검증, 파싱
//JWT properties의 속성들을 기반으로 토큰을 생성함
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final UserRepository usersRepository;

    /**
     * JWT 토큰 생성 메서드 (Access Token + Refresh Token)
     *
     * @param users 사용자 정보
     * @param response HTTP 응답 객체 (쿠키 설정용)
     * @return 액세스 토큰을 포함한 Token 객체
     */
    public Token generateToken(User users, HttpServletResponse response) {
        // JwtProperties에서 만료 시간 가져오기
        long accessTokenExpiresIn = jwtProperties.getExpirationTime();
        long refreshTokenExpiresIn = jwtProperties.getRefreshExpirationTime();

        // 액세스 토큰 생성
        String accessToken = generateAccessToken(users, accessTokenExpiresIn);
        // 리프레시 토큰 생성
        String refreshToken = generateRefreshToken(users, refreshTokenExpiresIn);

        LocalDateTime now = LocalDateTime.now();

        // Refresh Token DB에 저장
        users.updateRefreshToken(refreshToken);
        usersRepository.save(users);

        // Refresh Token을 HTTP-Only 쿠키로 설정
        addRefreshTokenCookie(response, refreshToken, (int) (refreshTokenExpiresIn / 1000));

        // 현재시간
        // 액세스 토큰 만료일을 알아보기 쉽게 3600000 -> 1시간
        long accessTokenExpiresInHours = accessTokenExpiresIn / 3600000;
        LocalDateTime expirationTime = now.plusHours(accessTokenExpiresInHours);

        // 응답에는 Access Token만 포함 (Refresh Token은 쿠키로 전송)
        return new Token(accessToken, null, expirationTime);
    }

    /**
     * Refresh Token을 HTTP-Only 쿠키로 설정
     */
    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken, int maxAgeInSeconds) {
        Cookie cookie = new Cookie("refresh_token", refreshToken);
        cookie.setHttpOnly(true);         // JavaScript에서 접근 불가
        cookie.setSecure(false);           // HTTPS에서만 전송
        cookie.setPath("/");              // 모든 경로에서 사용 가능
        cookie.setMaxAge(maxAgeInSeconds); // 쿠키 유효 기간 설정

        response.addCookie(cookie);
        log.info("Refresh Token 쿠키 설정 완료");
    }

    /**
     * 쿠키에서 Refresh Token 추출
     */
    public String extractRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * Refresh Token 쿠키 삭제 (로그아웃 시 사용)
     */
    public void deleteRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // 즉시 만료

        response.addCookie(cookie);
        log.info("Refresh Token 쿠키 삭제 완료");
    }

    /**
     * Access Token 갱신 (Refresh Token 사용)
     */
    public Token refreshAccessToken(HttpServletRequest request, HttpServletResponse response) throws SignatureException {
        // 쿠키에서 Refresh Token 추출
        String refreshToken = extractRefreshTokenFromCookies(request);

        if (refreshToken == null) {
            throw new GlobalException(JwtErrorCode.TOKEN_NOT_FOUND);
        }

        if (!validateToken(refreshToken)) {
            throw new GlobalException(JwtErrorCode.TOKEN_NOT_VALID);
        }

        Claims claims = getClaims(refreshToken);

        String tokenType = claims.get("tokenType", String.class);

        if (!"refresh".equals(tokenType)) {
            throw new GlobalException(JwtErrorCode.TOKEN_NOT_VALID);
        }

        // 사용자 ID 추출
        Long userId = Long.parseLong(claims.getSubject());

        // 사용자 조회
        User users = usersRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 저장된 리프레시 토큰과 일치하는지 확인
        if (!refreshToken.equals(users.getRefreshToken())) {
            throw new GlobalException(JwtErrorCode.REFRESH_NOT_VALID);
        }

        // 새 토큰 생성 (Access Token + 쿠키에 Refresh Token)
        return generateToken(users, response);
    }

    // 나머지 기존 메서드는 그대로 유지
    private Key getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecretKey().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String generateAccessToken(User users, long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        log.info("만료 시간: " + expiryDate);

        return Jwts.builder()
                .setSubject(String.valueOf(users.getId()))
                .claim("id", users.getId())
                .claim("email", users.getEmail())
                .claim("nickname", users.getNickname())
                .claim("tokenType", "access") // 토큰 타입 표시
                .setIssuedAt(now) // 발행 시간
                .setExpiration(expiryDate) // 만료 시간
                .setIssuer(jwtProperties.getIssuer()) // 발행자
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 서명 알고리즘
                .compact();
    }

    private String generateRefreshToken(User users, long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(String.valueOf(users.getId()))
                .claim("tokenType", "refresh") // 토큰 타입 표시
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setIssuer(jwtProperties.getIssuer())
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) throws SignatureException {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("유효하지 않은 JWT 토큰: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT 토큰 만료: {}", e.getMessage());
        }

        return false;
    }

    public Long getUserId(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.get("id", Long.class);
        } catch (Exception e) {
            log.error("토큰에서 userId 추출 오류: {}", e.getMessage());
            return null;
        }
    }

    public String getEmail(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.get("email", String.class);
        } catch (Exception e) {
            log.error("토큰에서 email 추출 오류: {}", e.getMessage());
            return null;
        }
    }

    public String getNickName(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.get("nickname", String.class);
        } catch (Exception e) {
            log.error("토큰에서 nickname 추출 오류: {}", e.getMessage());
            return null;
        }
    }
}