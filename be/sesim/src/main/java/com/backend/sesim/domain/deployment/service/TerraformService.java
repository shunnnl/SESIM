package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.StepStatusDto;
import com.backend.sesim.domain.deployment.dto.request.TerraformDeployRequest;
import com.backend.sesim.domain.deployment.dto.response.DeploymentStepsResponse;
import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.DeploymentErrorCode;
import com.backend.sesim.domain.deployment.exception.TerraformErrorCode;
import com.backend.sesim.domain.deployment.repository.DeploymentStepRepository;
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
import java.util.stream.Collectors;

import static com.backend.sesim.domain.deployment.constant.DeploymentConstants.*;

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
    private final SqlService sqlService;
    private final DeploymentStepRepository deploymentStepRepository;
    private final DeploymentService deploymentService;

    @Value("${aws.saas.access-key}")
    private String saasAccessKey;

    @Value("${aws.saas.secret-key}")
    private String saasSecretKey;

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

        // 1. 초기화 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(1)
                .stepName(STEP_INITIALIZATION)
                .stepStatus(STATUS_PENDING)
                .build());

        // 2. Terraform 템플릿 준비 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(2)
                .stepName(STEP_TERRAFORM_SETUP)
                .stepStatus(STATUS_PENDING)
                .build());

        // 3. Terraform 실행 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(3)
                .stepName(STEP_TERRAFORM_EXECUTION)
                .stepStatus(STATUS_PENDING)
                .build());

        // 4. 네트워크 설정 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(4)
                .stepName(STEP_NETWORK_SETUP)
                .stepStatus(STATUS_PENDING)
                .build());

        // 5. K3S 클러스터 설치 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(5)
                .stepName(STEP_K3S_SETUP)
                .stepStatus(STATUS_PENDING)
                .build());

        // 6. 완료 단계
        steps.add(DeploymentStep.builder()
                .project(project)
                .stepOrder(6)
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
                    .isApiKeyCheck(false)
                    .build();

            projectModelInformations.add(projectModelInfoRepository.save(modelInfo));
        }

        log.info("모델 정보 DB 저장 완료 - {} 개의 모델 저장됨", projectModelInformations.size());
        return projectModelInformations;
    }

    /**
     * 프로젝트 배포 단계 상태를 조회합니다.
     */
    public DeploymentStepsResponse getDeploymentSteps(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new GlobalException(DeploymentErrorCode.PROJECT_NOT_FOUND));

        List<DeploymentStep> steps = deploymentStepRepository.findByProjectIdOrderByStepOrder(projectId);

        // 현재 활성 단계 찾기
        Integer currentStepOrder = findCurrentStepOrder(steps);

        // 전체 프로젝트 상태 계산
        String overallStatus = calculateOverallStatus(steps);

        List<StepStatusDto> stepDtos = steps.stream()
                .map(step -> StepStatusDto.builder()
                        .stepId(step.getId())
                        .stepOrder(step.getStepOrder())
                        .stepName(step.getStepName())
                        .displayName(STEP_DISPLAY_NAMES.getOrDefault(step.getStepName(), step.getStepName()))
                        .description(STEP_DESCRIPTIONS.getOrDefault(step.getStepName(), ""))
                        .stepStatus(step.getStepStatus())
                        .build())
                .collect(Collectors.toList());

        return DeploymentStepsResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .overallStatus(overallStatus)
                .steps(stepDtos)
                .currentStepOrder(currentStepOrder)
                .build();
    }

    /**
     * 단계 상태를 기반으로 전체 프로젝트 상태를 계산합니다.
     */
    private String calculateOverallStatus(List<DeploymentStep> steps) {
        if (steps.isEmpty()) {
            return STATUS_PENDING;
        }

        // 실패한 단계가 있으면 FAILED
        for (DeploymentStep step : steps) {
            if (STATUS_FAILED.equals(step.getStepStatus())) {
                return STATUS_FAILED;
            }
        }

        // 진행 중인 단계가 있으면 DEPLOYING
        for (DeploymentStep step : steps) {
            if (STATUS_DEPLOYING.equals(step.getStepStatus())) {
                return STATUS_DEPLOYING;
            }
        }

        // 대기 중인 단계가 있으면 PENDING
        for (DeploymentStep step : steps) {
            if (STATUS_PENDING.equals(step.getStepStatus())) {
                return STATUS_PENDING;
            }
        }

        // 모든 단계가 DEPLOYED면 DEPLOYED
        return STATUS_DEPLOYED;
    }

    /**
     * 현재 활성화된 단계의 순서를 찾습니다.
     */
    private Integer findCurrentStepOrder(List<DeploymentStep> steps) {
        // 1. 먼저 DEPLOYING 상태인 단계를 찾음
        for (DeploymentStep step : steps) {
            if (STATUS_DEPLOYING.equals(step.getStepStatus())) {
                return step.getStepOrder();
            }
        }

        // 2. 마지막으로 DEPLOYED 단계 이후, 첫 번째 PENDING 단계 찾기
        Integer lastDeployedOrder = 0;
        for (DeploymentStep step : steps) {
            if (STATUS_DEPLOYED.equals(step.getStepStatus()) && step.getStepOrder() > lastDeployedOrder) {
                lastDeployedOrder = step.getStepOrder();
            }
        }

        // 마지막 완료 단계 이후의 첫 번째 대기 중 단계 찾기
        for (DeploymentStep step : steps) {
            if (STATUS_PENDING.equals(step.getStepStatus()) && step.getStepOrder() > lastDeployedOrder) {
                return step.getStepOrder();
            }
        }

        // 모든 단계가 완료되었거나 실패한 경우, 마지막 단계 반환
        return steps.isEmpty() ? 1 : steps.size();
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