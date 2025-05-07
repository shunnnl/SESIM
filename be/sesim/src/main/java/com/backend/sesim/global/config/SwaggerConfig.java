package com.backend.sesim.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openApi() {
        // JWT 스키마 정의
        SecurityScheme jwtScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        // API 보안 요구사항 추가
        SecurityRequirement securityRequirement = new SecurityRequirement().addList("bearerAuth");

        // 서버 URL 설정 추가
        Server productionServer = new Server()
                .url("http://52.79.149.27")
                .description("Production Server");

        return new OpenAPI()
                .servers(Arrays.asList(productionServer))  // 서버 정보 추가
                .components(new Components().addSecuritySchemes("bearerAuth", jwtScheme))
                .security(java.util.List.of(securityRequirement))
                .info(new Info()
                        .title("sesim API")
                        .description("sesim 서비스의 API 문서")
                        .version("1.0.0"));
    }
}