package com.backend.sesim.domain.deployment.constant;

import java.util.Map;

/**
 * 배포 과정에서 사용되는 상수들을 정의합니다.
 */
public class DeploymentConstants {

    // 배포 단계 상수
    public static final String STEP_INITIALIZATION = "INITIALIZATION";
    public static final String STEP_TERRAFORM_SETUP = "TERRAFORM_SETUP";
    public static final String STEP_TERRAFORM_EXECUTION = "TERRAFORM_EXECUTION";
    public static final String STEP_NETWORK_SETUP = "NETWORK_SETUP";
    public static final String STEP_K3S_SETUP = "K3S_SETUP";
    public static final String STEP_COMPLETION = "COMPLETION";

    // 배포 상태 상수
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_DEPLOYING = "DEPLOYING";
    public static final String STATUS_DEPLOYED = "DEPLOYED";
    public static final String STATUS_FAILED = "FAILED";

    // 프론트엔드 표시용 이름
    public static final Map<String, String> STEP_DISPLAY_NAMES = Map.of(
            STEP_INITIALIZATION, "초기화",
            STEP_TERRAFORM_SETUP, "템플릿 준비",
            STEP_TERRAFORM_EXECUTION, "인프라 배포",
            STEP_NETWORK_SETUP, "네트워크 설정",
            STEP_K3S_SETUP, "K3S 클러스터 설치",
            STEP_COMPLETION, "배포 완료"
    );

    // 프론트엔드 표시용 설명
    public static final Map<String, String> STEP_DESCRIPTIONS = Map.of(
            STEP_INITIALIZATION, "배포 리소스 초기화 및 준비 중입니다.",
            STEP_TERRAFORM_SETUP, "Terraform 배포 템플릿 파일을 생성하는 단계입니다.",
            STEP_TERRAFORM_EXECUTION, "AWS에 인프라 리소스(VPC, EC2 등)를 배포하는 단계입니다.",
            STEP_NETWORK_SETUP, "네트워크 및 ALB 설정을 업데이트하는 단계입니다.",
            STEP_K3S_SETUP, "경량 쿠버네티스 클러스터(K3S)를 설치하는 단계입니다.",
            STEP_COMPLETION, "모든 배포 과정이 완료되었습니다."
    );

    private DeploymentConstants() {}
}