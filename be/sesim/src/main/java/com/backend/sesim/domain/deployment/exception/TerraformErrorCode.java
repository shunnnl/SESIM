package com.backend.sesim.domain.deployment.exception;

import com.backend.sesim.global.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TerraformErrorCode implements ErrorCode {
    // Terraform 관련 에러
    TERRAFORM_FILE_CREATION_FAILED(500, "테라폼 파일 생성에 실패했습니다."),
    TERRAFORM_EXECUTION_FAILED(500, "테라폼 명령 실행에 실패했습니다."),
    TERRAFORM_NOT_INSTALLED(500, "테라폼이 설치되어 있지 않습니다."),
    UNSUPPORTED_REGION(400, "지원하지 않는 AWS 리전입니다."),
    INVALID_DEPLOYMENT_ID(400, "유효하지 않은 배포 ID입니다."),
    INVALID_ROLE_ARN(400, "유효하지 않은 IAM Role ARN입니다."),
    INVALID_ARN_ID(400,  "유효하지 않은 ARN ID입니다."),
    INVALID_MODEL_ID(400, "유효하지 않은 모델 ID입니다."),
    INVALID_SPEC_ID(400,  "유효하지 않은 사양 ID입니다."),
    INVALID_REGION_ID(400,  "유효하지 않은 리전 ID입니다."),

    // K3s 자동 설치 관련 에러
    K3S_SETUP_FAILED(500, "K3S 클러스터 설치에 실패했습니다."),
    K3S_SETUP_TIMEOUT(500, "K3S 클러스터 설치 시간이 초과되었습니다."),
    K3S_INSUFFICIENT_INSTANCES(400, "K3S 클러스터 설치에 필요한 인스턴스 수가 부족합니다."),

    // SQL 생성 관련 에러
    SQL_CREATE_INIT(500, "초기 데이터 파일 생성을 실패했습니다."),

    // Project 생성 관련 에러
    PROJECT_INSUFFICIENT_DATA(400, "프로젝트 생성하기위한 정보가 불충분합니다.");

    private final int status;
    private final String message;

    @Override
    public String code() {
        return name();
    }
}