package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.TerraformErrorCode;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.deployment.util.TerraformExecutor;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.domain.iam.repository.RoleArnRepository;
import com.backend.sesim.domain.resourcemanagement.entity.InfrastructureSpec;
import com.backend.sesim.domain.resourcemanagement.entity.Model;
import com.backend.sesim.domain.resourcemanagement.entity.Region;
import com.backend.sesim.domain.resourcemanagement.repository.InfrastructureSpecRepository;
import com.backend.sesim.domain.resourcemanagement.repository.ModelRepository;
import com.backend.sesim.domain.resourcemanagement.repository.RegionRepository;
import com.backend.sesim.global.exception.GlobalException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
    private final RoleArnRepository roleArnRepository;
    private final ProjectRepository projectRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final ModelRepository modelRepository;
    private final InfrastructureSpecRepository infrastructureSpecRepository;
    private final RegionRepository regionRepository;

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
    public void deployToSaasAccount(TerraformDeployRequest request) {
        // arnId 유효성 검증
        if (request.getArnId() == null) {
            throw new GlobalException(TerraformErrorCode.INVALID_ARN_ID);
        }

        // ARN 조회
        RoleArn roleArn = roleArnRepository.findById(request.getArnId())
                .orElseThrow(() -> new GlobalException(TerraformErrorCode.INVALID_ARN_ID));

        // deploymentId 자동 생성
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomId = UUID.randomUUID().toString().substring(0, 8);
        String deploymentId = "deployment-" + timestamp + "-" + randomId;
        log.info("배포 ID 자동 생성: {}", deploymentId);


        // 테라폼 설치 여부 확인
        if (!terraformExecutor.isTerraformInstalled()) {
            throw new GlobalException(TerraformErrorCode.TERRAFORM_NOT_INSTALLED);
        }

        // 운영체제에 맞는 임시 디렉토리 사용
        String tempDir = System.getProperty("java.io.tmpdir");
        String workingDir = Paths.get(tempDir, "terraform", deploymentId).toString();
        log.info("작업 디렉토리: {}", workingDir);

        // 고객 ID 추출 (IAM Role ARN에서)
        String customerId = extractCustomerId(roleArn.getRoleArn());

        try {
            // 템플릿 생성 - SaaS 계정 자격 증명 사용
            templateService.createSaasTerraformFiles(
                    workingDir,
                    deploymentId,
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
                    deploymentId,
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

            // 프로젝트 및 모델 정보를 DB에 저장
            if (request.getProjectName() != null && request.getModelConfigs() != null && !request.getModelConfigs().isEmpty()) {
                saveProjectAndModelInfo(roleArn, request, ec2PublicIps, k3sSetupSuccess);
            }


        } catch (IOException e) {
            log.error("Terraform 파일 생성 실패: {}", e.getMessage(), e);
            throw new GlobalException(TerraformErrorCode.TERRAFORM_FILE_CREATION_FAILED);
        }
    }

    /**
     * 프로젝트 및 모델 정보를 데이터베이스에 저장합니다.
     */
    private void saveProjectAndModelInfo(RoleArn roleArn, TerraformDeployRequest request, List<String> ec2PublicIps, boolean isDeploySuccess) {
        try {
            String albAddress = null;
            if (ec2PublicIps != null && !ec2PublicIps.isEmpty()) {
                String masterIp = ec2PublicIps.get(0);
                albAddress = "http://" + masterIp + "/api/"; // 전체 API 엔드포인트 URL 저장
            }

            // 프로젝트 생성 및 저장
            Project project = Project.builder()
                    .roleArn(roleArn)  // 이미 조회된 RoleArn 엔티티 사용
                    .name(request.getProjectName())
                    .description(request.getProjectDescription())
                    .albAddress(albAddress)
                    .build();

            Project savedProject = projectRepository.save(project);

            // 각 모델 구성 정보를 저장
            if (request.getModelConfigs() != null && !request.getModelConfigs().isEmpty()) {
                for (TerraformDeployRequest.ModelConfig config : request.getModelConfigs()) {
                    // 모델, 사양, 리전 엔티티 조회
                    Model model = modelRepository.findById(config.getModelId())
                            .orElseThrow(() -> new GlobalException(TerraformErrorCode.INVALID_MODEL_ID));

                    InfrastructureSpec spec = infrastructureSpecRepository.findById(config.getSpecId())
                            .orElseThrow(() -> new GlobalException(TerraformErrorCode.INVALID_SPEC_ID));

                    Region region = regionRepository.findById(config.getRegionId())
                            .orElseThrow(() -> new GlobalException(TerraformErrorCode.INVALID_REGION_ID));

                    // 고유한 API 키 생성
                    String apiKey = generateApiKey();

                    // 모델 정보 생성 및 저장
                    ProjectModelInformation modelInfo = ProjectModelInformation.builder()
                            .project(savedProject)
                            .model(model)
                            .spec(spec)
                            .region(region)
                            .status(isDeploySuccess ? "DEPLOYED" : "FAILED")
                            .modelApiKey(apiKey)
                            .isApiKeyCheck(false)
                            .build();

                    projectModelInfoRepository.save(modelInfo);
                }
            }

            log.info("프로젝트 및 모델 정보 DB 저장 완료 - 프로젝트 ID: {}", savedProject.getId());

        } catch (Exception e) {
            log.error("프로젝트 및 모델 정보 DB 저장 실패: {}", e.getMessage(), e);
            // 저장 실패해도 배포 자체는 계속 진행
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

    /**
     * 안전한 API 키를 생성합니다.
     * @return 생성된 API 키
     */
    private String generateApiKey() {
        // UUID와 타임스탬프를 조합하여 고유한 키 생성
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());

        return "sesim-" + uuid.substring(0, 24) + timestamp.substring(timestamp.length() - 4);
    }
}