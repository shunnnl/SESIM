package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.dto.response.DeployResultResponse;
import com.backend.sesim.domain.deployment.exception.TerraformErrorCode;
import com.backend.sesim.domain.deployment.util.TerraformExecutor;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerraformService {

    private final TerraformTemplateService templateService;
    private final TerraformExecutor terraformExecutor;
    private final K3sSetupService k3sSetupService;

    // 고정 리전 상수 추가
    private static final String FIXED_REGION = "ap-northeast-2";
    private static final String FIXED_AMI_ID = "ami-0898b9c266ded3337"; // 서울 리전 Ubuntu 20.04

    @Value("${aws.saas.access-key}")
    private String saasAccessKey;

    @Value("${aws.saas.secret-key}")
    private String saasSecretKey;

    @Value("${k3s.setup.timeout:600}")  // 기본 10분 (600초) 제한 시간
    private int k3sSetupTimeoutSeconds;

    /**
     * SaaS 계정에 AWS 리소스를 배포합니다.
     *
     * @param request 배포 요청 정보
     * @return 배포 결과
     */
    public DeployResultResponse deployToSaasAccount(TerraformDeployRequest request) {
        // 입력값 검증
        validateDeployRequest(request);

        // 테라폼 설치 여부 확인
        if (!terraformExecutor.isTerraformInstalled()) {
            throw new GlobalException(TerraformErrorCode.TERRAFORM_NOT_INSTALLED);
        }

        // 운영체제에 맞는 임시 디렉토리 사용
        String tempDir = System.getProperty("java.io.tmpdir");
        String workingDir = Paths.get(tempDir, "terraform", request.getDeploymentId()).toString();
        log.info("작업 디렉토리: {}", workingDir);

        // 고객 ID 추출 (IAM Role ARN에서)
        String customerId = extractCustomerId(request.getIamRoleArn());

        try {
            // 템플릿 생성 - SaaS 계정 자격 증명 사용
            templateService.createSaasTerraformFiles(
                    workingDir,
                    request.getDeploymentId(),
                    customerId,
                    FIXED_REGION,
                    FIXED_AMI_ID,
                    saasAccessKey,
                    saasSecretKey,
                    ""  // 세션 토큰 불필요
            );

            // Terraform 실행
            boolean success = terraformExecutor.runTerraformInitAndApply(Paths.get(workingDir));

            if (!success) {
                throw new GlobalException(TerraformErrorCode.TERRAFORM_EXECUTION_FAILED);
            }

            // 결과 수집
            Map<String, Object> outputs = terraformExecutor.getOutputs(Paths.get(workingDir));
            List<String> ec2PublicIps = (List<String>) outputs.get("ec2_public_ips");
            String pemKeyPath = (String) outputs.get("pem_file_path");

            // K3S 클러스터 설치 (비동기로 실행)
            log.info("K3S 클러스터 설치 시작 (비동기)");
            Future<Boolean> k3sFuture = k3sSetupService.setupK3sClusterAsync(
                    ec2PublicIps,
                    pemKeyPath,
                    request.getDeploymentId(),
                    customerId
            );

            boolean k3sSetupSuccess = false;
            try {
                // 설정된 시간만큼 대기
                k3sSetupSuccess = k3sFuture.get(k3sSetupTimeoutSeconds, TimeUnit.SECONDS);
                log.info("K3S 클러스터 설치 완료: {}", k3sSetupSuccess ? "성공" : "실패");
            } catch (TimeoutException e) {
                log.warn("K3S 클러스터 설치 제한 시간 초과 ({}초)", k3sSetupTimeoutSeconds);
                // k3sFuture.cancel(true); // 작업 취소 (필요한 경우)
            } catch (Exception e) {
                log.error("K3S 클러스터 설치 예외 발생: {}", e.getMessage(), e);
            }

            DeployResultResponse response = DeployResultResponse.builder()
                    .deploymentId(request.getDeploymentId())
                    .customerId(customerId)
                    .ec2PublicIps(ec2PublicIps)
                    .pemKeyPath(pemKeyPath)
                    .pemKeyPath(pemKeyPath)
                    .k3sSetupCompleted(k3sSetupSuccess)
                    .build();

            if (k3sSetupSuccess && ec2PublicIps != null && !ec2PublicIps.isEmpty()) {
                String masterIp = ec2PublicIps.get(0);
                response.setApiEndpoint("http://" + masterIp + "/api");
                response.setGrafanaEndpoint("http://" + masterIp + "/grafana");
            }

            return response;

        } catch (IOException e) {
            log.error("Terraform 파일 생성 실패: {}", e.getMessage(), e);
            throw new GlobalException(TerraformErrorCode.TERRAFORM_FILE_CREATION_FAILED);
        }
    }

    /**
     * 배포 요청 데이터의 유효성을 검증합니다.
     *
     * @param request 배포 요청 정보
     */
    private void validateDeployRequest(TerraformDeployRequest request) {
        if (request.getDeploymentId() == null || request.getDeploymentId().trim().isEmpty()) {
            throw new GlobalException(TerraformErrorCode.INVALID_DEPLOYMENT_ID);
        }

        if (request.getIamRoleArn() == null || !request.getIamRoleArn().startsWith("arn:aws:iam::")) {
            throw new GlobalException(TerraformErrorCode.INVALID_ROLE_ARN);
        }
    }

    /**
     * 고객 ID 추출 (IAM Role ARN에서)
     *
     * @param roleArn IAM Role ARN
     * @return 고객 ID (AWS 계정 ID)
     */
    private String extractCustomerId(String roleArn) {
        // arn:aws:iam::123456789012:role/stack-name-sesim-access-role
        String[] parts = roleArn.split(":");
        if (parts.length >= 5) {
            return parts[4]; // AWS 계정 ID
        }
        return "unknown-customer";
    }
}