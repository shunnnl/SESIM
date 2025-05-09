package com.backend.sesim.domain.deployment.constant;

/**
 * 배포 과정에서 사용되는 상수들을 정의합니다.
 */
public class DeploymentConstants {

    // 배포 단계 상수
    public static final String STEP_INFRASTRUCTURE = "INFRASTRUCTURE";  // 인프라 생성
    public static final String STEP_ENVIRONMENT = "ENVIRONMENT";       // 환경 구축
    public static final String STEP_SERVER_DEPLOYMENT = "SERVER_DEPLOYMENT";  // 서버 배포
    public static final String STEP_COMPLETION = "COMPLETION"; // 배포 완료

    // 배포 상태 상수
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_DEPLOYING = "DEPLOYING";
    public static final String STATUS_DEPLOYED = "DEPLOYED";
    public static final String STATUS_FAILED = "FAILED";

    private DeploymentConstants() {}
}