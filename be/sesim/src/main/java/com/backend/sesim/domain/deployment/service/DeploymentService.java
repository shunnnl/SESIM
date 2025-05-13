package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.RegisterIp;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.DeploymentErrorCode;
import com.backend.sesim.domain.deployment.repository.DeploymentStepRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.deployment.repository.RegisterIpRepository;
import com.backend.sesim.domain.deployment.util.TerraformExecutor;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.model.*;
import com.amazonaws.services.ec2.model.IpRange;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.backend.sesim.domain.deployment.constant.DeploymentConstants.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeploymentService {

    private final TerraformTemplateService templateService;
    private final TerraformExecutor terraformExecutor;
    private final K3sSetupService k3sSetupService;
    private final ProjectRepository projectRepository;
    private final DeploymentStepRepository deploymentStepRepository;
    private final SqlService sqlService;
    private final DeploymentStepSSEService sseService;
    private final RegisterIpRepository registerIpRepository;
    private final AmazonEC2 amazonEC2;

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

        try {
            // 1. 인프라 생성 단계 시작
            updateStepStatus(projectId, STEP_INFRASTRUCTURE, STATUS_DEPLOYING);

            try {
                // 프로젝트에 등록된 IP 주소 목록 조회
                List<String> allowedIpAddresses = registerIpRepository.findByProjectId(projectId)
                        .stream()
                        .map(RegisterIp::getIpNumber)
                        .collect(Collectors.toList());

                log.info("프로젝트 ID: {}에 등록된 IP 주소 수: {}", projectId, allowedIpAddresses.size());

                // 운영체제에 맞는 임시 디렉토리 사용
                String tempDir = System.getProperty("java.io.tmpdir");
                String workingDir = Paths.get(tempDir, "terraform", deploymentId).toString();
                log.info("작업 디렉토리: {}", workingDir);

                // Terraform 템플릿 파일 생성
                log.info("Terraform 템플릿 파일 생성 중...");
                templateService.createSaasTerraformFiles(
                        workingDir,
                        deploymentId,
                        customerId,
                        FIXED_REGION,
                        FIXED_AMI_ID,
                        saasAccessKey,
                        saasSecretKey,
                        "",  // 세션 토큰 불필요
                        allowedIpAddresses // 허용 IP 목록 전달
                );

                // Terraform 실행
                log.info("Terraform 실행 중...");
                boolean success = terraformExecutor.runTerraformInitAndApply(Paths.get(workingDir));

                if (!success) {
                    log.error("Terraform 실행 실패");
                    updateStepStatus(projectId, STEP_INFRASTRUCTURE, STATUS_FAILED);
                    return;
                }

                // 결과 수집
                Map<String, Object> outputs = terraformExecutor.getOutputs(Paths.get(workingDir));
                List<String> ec2PublicIps = (List<String>) outputs.get("ec2_public_ips");
                String pemKeyPath = (String) outputs.get("pem_file_path");

                // ALB 주소 업데이트
                if (ec2PublicIps != null && !ec2PublicIps.isEmpty()) {
                    String masterIp = ec2PublicIps.get(0);
                    String albAddress = "http://" + masterIp;
                    project.updateAlbAddress(albAddress);
                    projectRepository.save(project);
                    log.info("ALB 주소 업데이트: {}", albAddress);
                } else {
                    throw new RuntimeException("EC2 인스턴스 IP 주소를 찾을 수 없습니다.");
                }

                // 인프라 생성 완료
                updateStepStatus(projectId, STEP_INFRASTRUCTURE, STATUS_DEPLOYED);

                // 2. 환경 구축 단계 시작
                updateStepStatus(projectId, STEP_ENVIRONMENT, STATUS_DEPLOYING);

                // 중요: 영속 상태의 프로젝트를 다시 조회
                Project freshProject = projectRepository.findProjectWithRoleArnById(projectId)
                        .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

                // init.sql 파일 생성
                File initSql = sqlService.makeInitSql(freshProject, modelInfos);
                log.info("init.sql 파일 생성 완료");

                // K3S 클러스터 설치
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
                    updateStepStatus(projectId, STEP_ENVIRONMENT, STATUS_FAILED);
                    return;
                }

                // 환경 구축 완료
                updateStepStatus(projectId, STEP_ENVIRONMENT, STATUS_DEPLOYED);

                // 3. 서버 배포 단계 시작
                updateStepStatus(projectId, STEP_SERVER_DEPLOYMENT, STATUS_DEPLOYING);

                // 서버 배포 로직 추가 (기존 로직을 여기에 배치)
                boolean allPodsReady = k3sSetupService.checkAllPodsReady(
                    ec2PublicIps.get(0),  // master IP
                    deploymentId,           // DeploymentId
                    "client-system",      // namespace
                    300                   // timeout seconds
                );

                // 서버 배포 완료
                if(allPodsReady) {
                    updateStepStatus(projectId, STEP_SERVER_DEPLOYMENT, STATUS_DEPLOYED);
                }

                if (!allPodsReady) {
                    log.error("서버 배포 실패");
                    updateStepStatus(projectId, STEP_SERVER_DEPLOYMENT, STATUS_FAILED);
                    return;
                }

                // 4. 완료 단계 시작
                updateStepStatus(projectId, STEP_COMPLETION, STATUS_DEPLOYING);

                boolean deletedDirectory = k3sSetupService.deleteFile(ec2PublicIps.get(0), deploymentId);

                if(deletedDirectory) {
                    // 완료 단계가 성공하면 보안 그룹 업데이트 시도
                    try {
                        // 보안 그룹 ID 찾기
                        String securityGroupId = findSecurityGroupId(deploymentId, customerId);

                        if (securityGroupId != null) {
                            // 프로젝트에 등록된 IP 주소 목록 다시 조회
                            List<String> updatedIpAddresses = registerIpRepository.findByProjectId(projectId)
                                    .stream()
                                    .map(RegisterIp::getIpNumber)
                                    .collect(Collectors.toList());

                            // SSH 포트 접근 제한 업데이트
                            updateSshSecurityGroupRule(securityGroupId, updatedIpAddresses);
                            log.info("보안 그룹 업데이트 완료: SSH 포트에 IP 제한 적용됨");
                        } else {
                            log.warn("보안 그룹을 찾을 수 없어 SSH 포트 제한 적용 실패");
                        }
                    } catch (Exception e) {
                        log.error("보안 그룹 업데이트 중 오류 발생: {}", e.getMessage(), e);
                        // 보안 그룹 업데이트 실패해도 배포는 성공으로 처리
                    }

                    // 완료 단계 완료
                    updateStepStatus(projectId, STEP_COMPLETION, STATUS_DEPLOYED);
                }

                if(!deletedDirectory) {
                    // 완료 단계 실패
                    log.error("완료 실패");
                    updateStepStatus(projectId, STEP_COMPLETION, STATUS_FAILED);
                    return;
                }

                log.info("배포 완료 - 프로젝트 ID: {}", projectId);

            } catch (IOException e) {
                log.error("Terraform 파일 생성 실패: {}", e.getMessage(), e);
                updateCurrentStepToFailed(projectId);
                return;
            } catch (Exception e) {
                log.error("배포 중 예외 발생: {}", e.getMessage(), e);
                updateCurrentStepToFailed(projectId);
            }

        } catch (Exception e) {
            log.error("배포 초기화 중 예외 발생: {}", e.getMessage(), e);
            updateStepStatus(projectId, STEP_INFRASTRUCTURE, STATUS_FAILED);
        }
    }

    /**
     * 태그를 기반으로 보안 그룹 ID를 찾습니다.
     */
    private String findSecurityGroupId(String deploymentId, String customerId) {
        try {
            // 보안 그룹 이름으로 검색
            String securityGroupName = "client-node-sg-" + deploymentId;

            DescribeSecurityGroupsRequest request = new DescribeSecurityGroupsRequest()
                    .withFilters(
                            new Filter("tag:DeploymentId").withValues(deploymentId),
                            new Filter("tag:CustomerId").withValues(customerId)
                    );

            DescribeSecurityGroupsResult result = amazonEC2.describeSecurityGroups(request);

            if (!result.getSecurityGroups().isEmpty()) {
                return result.getSecurityGroups().get(0).getGroupId();
            }

            // 이름으로도 시도
            request = new DescribeSecurityGroupsRequest()
                    .withFilters(new Filter("group-name").withValues(securityGroupName));

            result = amazonEC2.describeSecurityGroups(request);

            if (!result.getSecurityGroups().isEmpty()) {
                return result.getSecurityGroups().get(0).getGroupId();
            }

            log.warn("보안 그룹을 찾을 수 없음: DeploymentId={}, CustomerId={}", deploymentId, customerId);
            return null;
        } catch (Exception e) {
            log.error("보안 그룹 검색 중 오류: {}", e.getMessage(), e);
            return null;
        }
    }


    /**
     * 보안 그룹의 SSH 규칙을 업데이트합니다.
     * 모든 타입 호환성 문제를 방지하기 위해 단순화된 접근 방식 사용
     */
    private void updateSshSecurityGroupRule(String securityGroupId, List<String> allowedIpAddresses) {
        try {
            // Step 1: "0.0.0.0/0" IP 규칙 제거 시도
            try {
                amazonEC2.revokeSecurityGroupIngress(
                        new RevokeSecurityGroupIngressRequest()
                                .withGroupId(securityGroupId)
                                .withIpProtocol("tcp")
                                .withFromPort(22)
                                .withToPort(22)
                                .withCidrIp("0.0.0.0/0"));

                log.info("모든 IP에 대한 SSH 규칙(0.0.0.0/0) 제거 완료");
            } catch (Exception e) {
                // 규칙이 없을 수 있으므로 오류 무시하고 진행
                log.info("모든 IP에 대한 SSH 규칙이 없거나 제거 실패: {}", e.getMessage());
            }

            // Step 2: 허용 IP가 없으면 여기서 종료 (모든 SSH 접근 차단 유지)
            if (allowedIpAddresses == null || allowedIpAddresses.isEmpty()) {
                log.info("허용된 IP가 없어 SSH 접근이 모두 차단됩니다.");
                return;
            }

            // Step 3: 허용된 각 IP 주소에 대해 SSH 규칙 추가
            for (String ip : allowedIpAddresses) {
                // CIDR 형식 확인 및 변환
                String cidrIp = ip;
                if (!ip.contains("/")) {
                    cidrIp = ip + "/32";  // 단일 IP인 경우 /32 추가
                }

                try {
                    // 각 IP에 대해 새 규칙 추가
                    amazonEC2.authorizeSecurityGroupIngress(
                            new AuthorizeSecurityGroupIngressRequest()
                                    .withGroupId(securityGroupId)
                                    .withIpProtocol("tcp")
                                    .withFromPort(22)
                                    .withToPort(22)
                                    .withCidrIp(cidrIp));

                    log.info("SSH 포트(22)에 IP {} 접근 허용 규칙 추가 완료", cidrIp);
                } catch (Exception e) {
                    // 동일한 규칙이 이미 존재할 수 있으므로 오류 로그만 남기고 계속 진행
                    log.warn("IP {} 접근 규칙 추가 실패: {}", cidrIp, e.getMessage());
                }
            }

            log.info("SSH 접근 제한 업데이트 완료: 총 {}개 IP 허용", allowedIpAddresses.size());
        } catch (Exception e) {
            // 전체 프로세스 중 예외 발생 시 로그만 남기고 배포 프로세스 계속 진행
            log.error("보안 그룹 SSH 규칙 업데이트 과정에서 오류 발생: {}", e.getMessage());
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

        // SSE를 통해 상태 업데이트 알림
        sseService.notifyDeploymentStatusUpdate(step);
    }

    /**
     * 현재 진행 중인 단계를 실패로 표시합니다.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateCurrentStepToFailed(Long projectId) {
        List<DeploymentStep> steps = deploymentStepRepository.findByProjectIdOrderByStepOrder(projectId);

        for (DeploymentStep step : steps) {
            if (STATUS_DEPLOYING.equals(step.getStepStatus())) {
                step.updateStatus(STATUS_FAILED);
                deploymentStepRepository.saveAndFlush(step); // 즉시 DB에 반영
                log.info("현재 진행 중인 단계를 실패로 표시 - 프로젝트 ID: {}, 단계: {}", projectId, step.getStepName());

                // SSE를 통해 상태 업데이트 알림
                sseService.notifyDeploymentStatusUpdate(step);
                break;
            }
        }
    }
}