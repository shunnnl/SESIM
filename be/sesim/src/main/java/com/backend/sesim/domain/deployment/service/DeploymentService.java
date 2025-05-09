package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.DeploymentErrorCode;
import com.backend.sesim.domain.deployment.repository.DeploymentStepRepository;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.deployment.util.TerraformExecutor;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import static com.backend.sesim.domain.deployment.constant.DeploymentConstants.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeploymentService {

    // TerraformService의 의존성을 가지지 않고, 필요한 의존성을 직접 주입
    private final TerraformTemplateService templateService;
    private final TerraformExecutor terraformExecutor;
    private final K3sSetupService k3sSetupService;
    private final ProjectRepository projectRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final DeploymentStepRepository deploymentStepRepository;
    private final SqlService sqlService;

    @Value("${aws.saas.access-key}")
    private String saasAccessKey;

    @Value("${aws.saas.secret-key}")
    private String saasSecretKey;

    // 고정 리전 상수 추가
    private static final String FIXED_REGION = "ap-northeast-2";
    private static final String FIXED_AMI_ID = "ami-0898b9c266ded3337"; // 서울 리전 Ubuntu 20.04

    @Async("deploymentExecutor")
    public void executeDeploymentAsync(String deploymentId, String customerId, Long projectId, List<ProjectModelInformation> modelInfos) {
        log.info("비동기 배포 실행 시작 - 배포 ID: {}, 프로젝트 ID: {}", deploymentId, projectId);

        // 프로젝트 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> {
                    log.error("프로젝트 ID: {}에 해당하는 프로젝트를 찾을 수 없음", projectId);
                    return new GlobalException(DeploymentErrorCode.PROJECT_NOT_FOUND);
                });

        // 1. 초기화 단계 시작
        updateStepStatus(projectId, STEP_INITIALIZATION, STATUS_DEPLOYING);

        try {
            // 운영체제에 맞는 임시 디렉토리 사용
            String tempDir = System.getProperty("java.io.tmpdir");
            String workingDir = Paths.get(tempDir, "terraform", deploymentId).toString();
            log.info("작업 디렉토리: {}", workingDir);

            // 초기화 완료
            updateStepStatus(projectId, STEP_INITIALIZATION, STATUS_DEPLOYED);

            // 2. Terraform 템플릿 생성 단계 시작
            updateStepStatus(projectId, STEP_TERRAFORM_SETUP, STATUS_DEPLOYING);

            try {
                log.info("Terraform 템플릿 파일 생성 중...");
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

                // Terraform 템플릿 생성 완료
                updateStepStatus(projectId, STEP_TERRAFORM_SETUP, STATUS_DEPLOYED);
            } catch (IOException e) {
                log.error("Terraform 파일 생성 실패: {}", e.getMessage(), e);
                updateStepStatus(projectId, STEP_TERRAFORM_SETUP, STATUS_FAILED);
                return;
            }

            // 3. Terraform 실행 단계 시작
            updateStepStatus(projectId, STEP_TERRAFORM_EXECUTION, STATUS_DEPLOYING);

            try {
                log.info("Terraform 실행 중...");
                boolean success = terraformExecutor.runTerraformInitAndApply(Paths.get(workingDir));

                if (!success) {
                    log.error("Terraform 실행 실패");
                    updateStepStatus(projectId, STEP_TERRAFORM_EXECUTION, STATUS_FAILED);
                    return;
                }

                // Terraform 실행 완료
                updateStepStatus(projectId, STEP_TERRAFORM_EXECUTION, STATUS_DEPLOYED);
            } catch (Exception e) {
                log.error("Terraform 실행 중 오류: {}", e.getMessage(), e);
                updateStepStatus(projectId, STEP_TERRAFORM_EXECUTION, STATUS_FAILED);
                return;
            }

            // 4. 네트워크 설정 단계 시작
            updateStepStatus(projectId, STEP_NETWORK_SETUP, STATUS_DEPLOYING);

            try {
                // 결과 수집
                Map<String, Object> outputs = terraformExecutor.getOutputs(Paths.get(workingDir));
                List<String> ec2PublicIps = (List<String>) outputs.get("ec2_public_ips");
                String pemKeyPath = (String) outputs.get("pem_file_path");

                // ALB 주소 업데이트
                if (ec2PublicIps != null && !ec2PublicIps.isEmpty()) {
                    String masterIp = ec2PublicIps.get(0);
                    String albAddress = "http://" + masterIp + "/api/";
                    project.updateAlbAddress(albAddress);
                    projectRepository.save(project);
                    log.info("ALB 주소 업데이트: {}", albAddress);
                } else {
                    throw new RuntimeException("EC2 인스턴스 IP 주소를 찾을 수 없습니다.");
                }

                // 중요: 영속 상태의 프로젝트를 다시 조회
                Project freshProject = projectRepository.findProjectWithRoleArnById(projectId)
                        .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

                // init.sql 파일 생성
                File initSql = sqlService.makeInitSql(freshProject, modelInfos);
                log.info("init.sql 파일 생성 완료");

                // 네트워크 설정 완료
                updateStepStatus(projectId, STEP_NETWORK_SETUP, STATUS_DEPLOYED);

                // 5. K3S 클러스터 설치 단계 시작
                updateStepStatus(projectId, STEP_K3S_SETUP, STATUS_DEPLOYING);

                log.info("K3S 클러스터 설치 중...");
                boolean k3sSuccess = k3sSetupService.setupK3sCluster(
                        ec2PublicIps,
                        pemKeyPath,
                        deploymentId,
                        customerId,
                        initSql
                );

                if (!k3sSuccess) {
                    log.error("K3S 클러스터 설치 실패");
                    updateStepStatus(projectId, STEP_K3S_SETUP, STATUS_FAILED);
                    return;
                }

                // K3S 클러스터 설치 완료
                updateStepStatus(projectId, STEP_K3S_SETUP, STATUS_DEPLOYED);

                // 6. 완료 단계 시작
                updateStepStatus(projectId, STEP_COMPLETION, STATUS_DEPLOYING);


                // 완료 단계 완료
                updateStepStatus(projectId, STEP_COMPLETION, STATUS_DEPLOYED);

                log.info("배포 완료 - 프로젝트 ID: {}", projectId);

            } catch (Exception e) {
                log.error("배포 중 예외 발생: {}", e.getMessage(), e);
                // 현재 실행 중인 단계를 실패로 표시
                updateCurrentStepToFailed(projectId);
            }

        } catch (Exception e) {
            log.error("배포 초기화 중 예외 발생: {}", e.getMessage(), e);
            updateStepStatus(projectId, STEP_INITIALIZATION, STATUS_FAILED);

        }
    }


    /**
     * 배포 단계 상태를 업데이트합니다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateStepStatus(Long projectId, String stepName, String status) {
        DeploymentStep step = deploymentStepRepository.findByProjectIdAndStepName(projectId, stepName)
                .orElseThrow(() -> new RuntimeException("배포 단계를 찾을 수 없음: " + stepName));

        step.updateStatus(status);
        deploymentStepRepository.saveAndFlush(step);
        log.info("배포 단계 상태 업데이트 - 프로젝트 ID: {}, 단계: {}, 상태: {}", projectId, stepName, status);
    }

    /**
     * 현재 진행 중인 단계를 실패로 표시합니다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected  void updateCurrentStepToFailed(Long projectId) {
        List<DeploymentStep> steps = deploymentStepRepository.findByProjectIdOrderByStepOrder(projectId);

        for (DeploymentStep step : steps) {
            if (STATUS_DEPLOYING.equals(step.getStepStatus())) {
                step.updateStatus(STATUS_FAILED);
                deploymentStepRepository.saveAndFlush(step); // 즉시 DB에 반영
                log.info("현재 진행 중인 단계를 실패로 표시 - 프로젝트 ID: {}, 단계: {}", projectId, step.getStepName());
                break;
            }
        }
    }
}