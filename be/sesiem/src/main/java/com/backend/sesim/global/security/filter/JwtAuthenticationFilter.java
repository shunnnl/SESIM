package com.backend.sesim.global.security.filter;

import com.backend.sesim.global.security.config.SecurityPath;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();

        // ✅ Actuator 요청인지 확인하고 필터 통과
        if (uri.startsWith("/actuator")) {
            log.info("✅ [JwtAuthenticationFilter] Actuator 엔드포인트 요청 - 필터 건너뜀");
            filterChain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();
        log.info("[JwtAuthenticationFilter] 요청 시작: {} {}", method, uri);

        //1. 요청 헤더에서 JWT 토큰 추출(추후 개발)
        String token = resolveToken(request);
        log.info("[JwtAuthenticationFilter] 토큰 추출 결과: {}", token != null ? "토큰 있음" : "토큰 없음");

        // SecurityPath 매칭 확인
        boolean isPermitEndpoint = isPermitAllEndpoint(uri);
        log.info("[JwtAuthenticationFilter] 허용된 경로 여부: {}, 경로: {}", isPermitEndpoint, uri);

        // permitAll 경로이면서 토큰이 없는 경우 -> 그냥 통과
        if (isPermitEndpoint && token == null) {
            log.info("[JwtAuthenticationFilter] 허용된 경로이며 토큰이 없음 - 필터 통과");
            filterChain.doFilter(request, response);
            return;
        }

        // 인증이 필요한 경로에 토큰이 없는 경우 오류 응답 반환
        if (!isPermitEndpoint && token == null) {
            log.warn("[JwtAuthenticationFilter] 보호된 경로에 토큰 없음: {}", uri);
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 상태 코드

            String jsonResponse = "{\"success\":false,\"data\":null,\"error\":{\"code\":\"TOKEN_NOT_FOUND\",\"message\":\"인증 토큰이 필요합니다\",\"status\":401}}";
            response.getWriter().write(jsonResponse);
            return; // 여기서 필터 체인 종료
        }

        // 다음 필터로 요청 전달
        log.info("[JwtAuthenticationFilter] 다음 필터로 요청 전달");
        filterChain.doFilter(request, response);
        log.info("[JwtAuthenticationFilter] 필터 체인 처리 완료: {} {}", method, uri);
    }

    //사용자 정의 path 통과
    private boolean isPermitAllEndpoint(String uri) {
        log.info(uri);
        boolean matches = SecurityPath.matches(uri);
        log.debug("[JwtAuthenticationFilter] SecurityPath.matches 결과: {}, URI: {}", matches, uri);
        return matches;
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.debug("[JwtAuthenticationFilter] Authorization 헤더: {}", bearerToken);

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.debug("[JwtAuthenticationFilter] 추출된 토큰: {}", token);
            return token;
        }
        return null;
    }
}