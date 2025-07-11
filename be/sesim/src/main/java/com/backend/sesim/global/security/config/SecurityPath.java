package com.backend.sesim.global.security.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

//보안 경로를 관리하는 열거형(Enum) 클래스 -> 이 경로는 인증 처리를 안함
@Getter
@AllArgsConstructor
public enum SecurityPath {

    //Swagger 관련 경로
    SWAGGER("/swagger-ui/**"),
    SWAGGER_HTML("/swagger-ui.html"),
    SWAGGER_API_DOCS("/v3/api-docs"),
    SWAGGER_API_DOCS_ALL("/v3/api-docs/**"),
    SWAGGER_RESOURCES("/swagger-resources/**"),
    SWAGGER_UI("/api/swagger-ui/**"),
    SWAGGER_UI_API_DOCS("/api/v3/api-docs"),
    SWAGGER_UI_API_DOCS_ALL("/api/v3/api-docs/**"),
    SWAGGER_UI_RESOURCES("/api/swagger-resources/**"),
    SWAGGER_UI_HTML("/api/swagger-ui.html"),

    // Auth 관련 경로
    SIGNUP("/api/auth/signup"),
    LOGIN("/api/auth/login"),
    REFRESH("/api/auth/refresh"),

    // Mail 관련 경로
    SEND_CODE("/api/mail/send-code"),
    VERIFY("/api/mail/verify"),

    // Model 관련 경로
    MODEL("/api/model/**"),

    // Api 사용량 업데이트 관련 경로
    UPDATE_API_USAGE("/api/deployment/api-usage"),

    // Health check 관련 경로
    HEALTH("/health");

    // 각 Enum 상수가 가지는 경로 문자열
    private final String path;

    //SecurityPath enum에 정의된 모든 공개 경로를 String 배열로 변환해주는lll 메서드
    public static String[] getAllPublicPaths() {
        return java.util.Arrays.stream(values())
                .map(SecurityPath::getPath)
                .toArray(String[]::new);
    }

    public static boolean matches(String uri) {
        return java.util.Arrays.stream(values())
                .anyMatch(securityPath -> {
                    String pattern = securityPath.getPath();
                    // /** 패턴 처리
                    if (pattern.endsWith("/**")) {
                        String basePattern = pattern.substring(0, pattern.length() - 2);
                        return uri.startsWith(basePattern);
                    }
                    // 정확한 경로 매칭
                    return pattern.equals(uri);
                });
    }

}
