package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.entity.RegisterIp;
import com.backend.sesim.domain.deployment.exception.TerraformErrorCode;
import com.backend.sesim.domain.deployment.repository.DeploymentStepRepository;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.deployment.repository.RegisterIpRepository;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.backend.sesim.domain.deployment.constant.DeploymentConstants.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerraformService {

    private final TerraformExecutor terraformExecutor;
    private final RoleArnRepository roleArnRepository;
    private final ProjectRepository projectRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final ModelRepository modelRepository;
    private final InfrastructureSpecRepository infrastructureSpecRepository;
    private final RegionRepository regionRepository;
    private final DeploymentStepRepository deploymentStepRepository;
    private final DeploymentService deploymentService;
    private final RegisterIpRepository registerIpRepository;

    /**
     * SaaS 계정에 AWS 리소스를 배포합니다.
     * 초기 설정 후 즉시 응답하고 실제 배포는 비동기로 진행합니다.
     *
     * @param request 배포 요청 정보
     */
    @Transactional
    public void deployToSaasAccount(TerraformDeployRequest request) {
        // arnId 유효성 검증
        if (request.getArnId() == null) {
            log.error("ARN ID 유효성 검증 실패: 요청에서 ARN ID가 null입니다. 요청 정보: {}", request);
            throw new GlobalException(TerraformErrorCode.INVALID_ARN_ID);
        }

        // ARN 조회
        RoleArn roleArn = roleArnRepository.findById(request.getArnId())
                .orElseThrow(() -> {
                    log.error("ARN ID에 해당하는 RoleArn을 찾을 수 없음: {}", request.getArnId());
                    return new GlobalException(TerraformErrorCode.INVALID_ARN_ID);
                });

        // deploymentId 자동 생성
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomId = UUID.randomUUID().toString().substring(0, 8);
        String deploymentId = "deployment-" + timestamp + "-" + randomId;
        log.info("배포 ID 자동 생성: {}", deploymentId);

        // 테라폼 설치 여부 확인
        if (!terraformExecutor.isTerraformInstalled()) {
            throw new GlobalException(TerraformErrorCode.TERRAFORM_NOT_INSTALLED);
        }

        // 고객 ID 추출 (IAM Role ARN에서)
        String customerId = extractCustomerId(roleArn.getRoleArn());

        // 프로젝트 및 모델 정보 먼저 저장 (상태는 PENDING)
        Project project = saveProjectInfo(roleArn, request);
        List<ProjectModelInformation> modelInfos = saveModelInformation(request, project);

        // IP 주소 등록 로직 추가
        saveAllowedIpAddresses(request.getAllowedIpAddresses(), project);

        // 배포 단계 초기화
        initializeDeploymentSteps(project);

        // 중요: 변수를 final로 복사 (람다에서 사용하기 위함)
        final String finalDeploymentId = deploymentId;
        final String finalCustomerId = customerId;
        final Long finalProjectId = project.getId();
        final List<ProjectModelInformation> finalModelInfos = new ArrayList<>(modelInfos);

        // 트랜잭션 커밋 후에 비동기 호출이 실행되도록 등록
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deploymentService.executeDeploymentAsync(finalDeploymentId, finalCustomerId, finalProjectId, finalModelInfos);
            }
        });

        log.info("배포 요청 완료 - 백그라운드에서 배포 작업이 진행됩니다. 프로젝트 ID: {}", project.getId());
    }

    /**
     * 모든 배포 단계를 초기화합니다.
     */
    private void initializeDeploymentSteps(Project project) {
        List<DeploymentStep> steps = new ArrayList<>();

        // 1. 인프라 생성 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(1)
                .stepName(STEP_INFRASTRUCTURE)
                .stepStatus(STATUS_PENDING)
                .build());

        // 2. 환경 구축 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(2)
                .stepName(STEP_ENVIRONMENT)
                .stepStatus(STATUS_PENDING)
                .build());

        // 3. 서버 배포 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(3)
                .stepName(STEP_SERVER_DEPLOYMENT)
                .stepStatus(STATUS_PENDING)
                .build());

        // 4. 완료 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(4)
                .stepName(STEP_COMPLETION)
                .stepStatus(STATUS_PENDING)
                .build());

        deploymentStepRepository.saveAll(steps);
        log.info("배포 단계 초기화 완료 - 프로젝트 ID: {}", project.getId());
    }

    /**
     * 프로젝트 정보를 저장합니다.
     */
    private Project saveProjectInfo(RoleArn roleArn, TerraformDeployRequest request) {
        Project project = Project.builder()
                .roleArn(roleArn)
                .name(request.getProjectName())
                .description(request.getProjectDescription())
                .albAddress(null) // 배포 과정에서 업데이트됨
                .build();

        Project savedProject = projectRepository.save(project);
        log.info("프로젝트 정보 DB 저장 완료 - 프로젝트 ID: {}", savedProject.getId());
        return savedProject;
    }

    /**
     * 모델 정보를 저장합니다.
     */
    private List<ProjectModelInformation> saveModelInformation(TerraformDeployRequest request, Project savedProject) {
        List<ProjectModelInformation> projectModelInformations = new ArrayList<>();

        if (request.getModelConfigs() == null || request.getModelConfigs().isEmpty()) {
            throw new GlobalException(TerraformErrorCode.PROJECT_INSUFFICIENT_DATA);
        }

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
                    .modelApiKey(apiKey)
                    .build();

            projectModelInformations.add(projectModelInfoRepository.save(modelInfo));
        }

        log.info("모델 정보 DB 저장 완료 - {} 개의 모델 저장됨", projectModelInformations.size());
        return projectModelInformations;
    }

    /**
     * 허용된 IP 주소를 저장합니다.
     */
    private void saveAllowedIpAddresses(List<String> ipAddresses, Project project) {
        if (ipAddresses == null || ipAddresses.isEmpty()) {
            log.info("등록할 IP 주소가 없습니다. 모든 IP 주소에서 접근 가능합니다.");
            return;
        }

        // IP 주소 유효성 검증을 위한 정규식 패턴 (CIDR 표기법 포함)
        // IP 주소만 있는 형식(192.168.1.100)과 CIDR 표기법(192.168.1.100/24) 모두 허용
        Pattern ipPattern = Pattern.compile(
                "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(/([0-9]|[1-2][0-9]|3[0-2]))?$");

        for (String ipAddress : ipAddresses) {
            // IP 주소 유효성 검증
            if (!ipPattern.matcher(ipAddress).matches()) {
                log.warn("유효하지 않은 IP 주소 형식: {}", ipAddress);
                continue; // 유효하지 않은 IP는 건너뜀
            }

            // CIDR 표기법에서 IP 부분만 추출
            String ipOnly = ipAddress;
            if (ipAddress.contains("/")) {
                ipOnly = ipAddress.substring(0, ipAddress.indexOf("/"));
            }

            RegisterIp registerIp = RegisterIp.builder()
                    .project(project)
                    .ipNumber(ipAddress)  // CIDR 형식 그대로 저장
                    .build();

            registerIpRepository.save(registerIp);
            log.info("IP 주소 등록 완료: {}", ipAddress);
        }

        log.info("프로젝트 ID: {}에 대한 IP 주소 등록 완료", project.getId());
    }

    /**
     * 고객 ID 추출 (IAM Role ARN에서)
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
     */
    private String generateApiKey() {
        // UUID와 타임스탬프를 조합하여 고유한 키 생성
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = String.valueOf(System.currentTimeMillis());

        return "sesim-" + uuid.substring(0, 24) + timestamp.substring(timestamp.length() - 4);
    }
}