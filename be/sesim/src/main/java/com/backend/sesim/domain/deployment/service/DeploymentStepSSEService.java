package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.deployment.dto.response.DeploymentStatusUpdateResponse;
import com.backend.sesim.domain.deployment.dto.response.ProjectStatusResponse;
import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.repository.DeploymentStepRepository;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.domain.iam.repository.RoleArnRepository;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.transaction.annotation.Transactional;

import javax.management.relation.Role;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)  // 클래스 레벨에 적용
public class DeploymentStepSSEService {
    private static final Long DEFAULT_TIMEOUT = 60 * 60 * 1000L; // 1시간
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ProjectRepository projectRepository;
    private final DeploymentStepRepository deploymentStepRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final SecurityUtils securityUtils;
    private final UserRepository userRepository;
    private final RoleArnRepository roleArnRepository;

    /**
     * 클라이언트가 SSE에 연결할 때 호출되는 메서드
     */
    @Transactional(readOnly = true)
    public SseEmitter subscribe() {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        String emitterId = generateEmitterId(userId);
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        emitters.put(emitterId, emitter);
        log.info("새로운 SSE 연결 생성: {}", emitterId);

        // 연결 종료 시 emitter 제거
        emitter.onCompletion(() -> {
            emitters.remove(emitterId);
            log.info("SSE 연결 완료: {}", emitterId);
        });

        emitter.onTimeout(() -> {
            emitters.remove(emitterId);
            log.info("SSE 연결 타임아웃: {}", emitterId);
        });

        emitter.onError((e) -> {
            emitters.remove(emitterId);
            log.error("SSE 연결 에러: {}", emitterId, e);
        });

        // 연결 직후 초기 상태 전송
        try {
            sendInitialStatus(emitter);
            // 연결 확인용 이벤트 전송
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected!"));
        } catch (IOException e) {
            emitters.remove(emitterId);
            log.error("초기 데이터 전송 실패: {}", emitterId, e);
        }

        return emitter;
    }

    /**
     * 초기 배포 상태를 전송
     */
    private void sendInitialStatus(SseEmitter emitter) throws IOException {
        List<ProjectStatusResponse> statuses = getCurrentUserProjectsStatus();
        emitter.send(SseEmitter.event()
                .name("INIT")
                .data(statuses));
    }

    /**
     * 현재 로그인한 사용자의 프로젝트 배포 상태를 조회
     */
    protected List<ProjectStatusResponse> getCurrentUserProjectsStatus() {
        try {
            // 현재 로그인한 사용자 조회
            Long userId = securityUtils.getCurrentUsersId();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

            // 사용자의 RoleArn 목록 조회
            List<RoleArn> roleArns = roleArnRepository.findAllByUser(currentUser);

            // 사용자의 프로젝트 목록 조회
            List<Project> userProjects = projectRepository.findAllByRoleArnIn(roleArns);

            return userProjects.stream()
                    .map(this::convertToProjectStatusDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("사용자 프로젝트 상태 조회 실패: {}", e.getMessage());
            return List.of(); // 오류 발생 시 빈 리스트 반환
        }
    }


    /**
     * 프로젝트를 ProjectStatusResponse로 변환
     */
    @Transactional(readOnly = true)
    protected ProjectStatusResponse convertToProjectStatusDTO(Project project) {
        List<DeploymentStep> steps = deploymentStepRepository.findByProjectIdOrderByStepOrder(project.getId());

        // 2. 프로젝트 모델 정보 조회 (ProjectModelInfoRepository 주입 필요)
        List<ProjectModelInformation> modelInfos = projectModelInfoRepository.findByProjectId(project.getId());

        // Grafana URL 생성
        String grafanaUrl = "";
        if (project.getAlbAddress() != null && !project.getAlbAddress().isEmpty()) {
            String albAddress = project.getAlbAddress();
            if (!albAddress.endsWith("/")) {
                grafanaUrl = albAddress + "/grafana";
            } else {
                grafanaUrl = albAddress + "grafana";
            }
        }

        return ProjectStatusResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .albAddress(project.getAlbAddress())
                .grafanaUrl(grafanaUrl)
                .steps(steps.stream()
                        .map(step -> new ProjectStatusResponse.StepStatus(
                                step.getId(),
                                step.getStepOrder(),
                                step.getStepName(),
                                step.getStepStatus()))
                        .collect(Collectors.toList()))
                .models(modelInfos.stream()
                        .map(modelInfo -> {
                            // 모델의 short_description에서 첫 번째 줄 추출
                            String description = "";
                            if (modelInfo.getModel().getShortDescription() != null) {
                                String[] lines = modelInfo.getModel().getShortDescription().split("\\n");
                                if (lines.length > 0) {
                                    description = lines[0];
                                }
                            }

                            return new ProjectStatusResponse.ModelInfo(
                                    modelInfo.getModel().getId(),
                                    modelInfo.getModel().getName(),
                                    description);  // 모델별 설명 추가
                        })
                        .collect(Collectors.toList()))
                .build();
    }


    /**
     * 프로젝트 ID로 프로젝트 소유자의 사용자 ID 조회
     */
    private Long getProjectOwnerId(Long projectId) {
        try {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없음: " + projectId));

            // 프로젝트의 RoleArn을 통해 사용자 ID 조회
            RoleArn roleArn = project.getRoleArn();
            if (roleArn != null && roleArn.getUser() != null) {
                return roleArn.getUser().getId();
            }

            // 소유자 정보가 없는 경우
            log.warn("프로젝트 {} 소유자 정보 없음", projectId);
            return null;
        } catch (Exception e) {
            log.error("프로젝트 소유자 ID 조회 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 배포 상태가 업데이트될 때 프로젝트 소유자의 클라이언트에게만 알림
     */
    @Transactional(readOnly = true)
    public void notifyDeploymentStatusUpdate(DeploymentStep step) {
        try {
            // 1. step에서 projectId만 가져옴
            Long projectId = step.getProject().getId();

            // 2. 프로젝트 정보를 다시 조회
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없음: " + projectId));

            // 3. 프로젝트 소유자 ID 조회
            Long ownerId = getProjectOwnerId(projectId);
            if (ownerId == null) {
                log.warn("프로젝트 소유자를 찾을 수 없음, 알림 전송 건너뜀: {}", projectId);
                return;
            }

            // 4. 프로젝트 상태 DTO 생성
            ProjectStatusResponse projectStatus = convertToProjectStatusDTO(project);

            // 5. 업데이트 DTO 생성
            DeploymentStatusUpdateResponse updateDTO = DeploymentStatusUpdateResponse.builder()
                    .projectId(projectId)
                    .projectStatus(projectStatus)
                    .stepId(step.getId())
                    .stepStatus(step.getStepStatus())
                    .stepName(step.getStepName())
                    .build();

            // 6. 프로젝트 소유자의 클라이언트에게만 이벤트 전송
            sendToUserEmitters(ownerId, "STATUS_UPDATE", updateDTO);
            log.info("배포 상태 업데이트 전송: 프로젝트={}, 소유자={}, 스텝={}, 상태={}",
                    projectId, ownerId, step.getId(), step.getStepStatus());
        } catch (Exception e) {
            log.error("배포 상태 업데이트 알림 실패: {}", e.getMessage());
        }
    }



    /**
     * 특정 사용자의 이미터에게만 이벤트 전송
     */
    private <T> void sendToUserEmitters(Long userId, String eventName, T data) {
        if (userId == null) {
            log.warn("사용자 ID가 null, 이벤트 전송 건너뜀");
            return;
        }

        // 해당 사용자 ID를 가진 이미터 찾기
        String userPrefix = "sse-" + userId + "-";
        boolean sent = false;

        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            String emitterId = entry.getKey();
            if (emitterId.startsWith(userPrefix)) {
                try {
                    entry.getValue().send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                    sent = true;
                    log.debug("이벤트 {} 전송 성공: {}", eventName, emitterId);
                } catch (IOException e) {
                    log.error("이벤트 전송 실패: {}", emitterId, e);
                    emitters.remove(emitterId);
                }
            }
        }

        if (!sent) {
            log.info("사용자 {}에게 전송할 이미터 없음", userId);
        }
    }

    /**
     * 고유한 이미터 ID 생성
     */
    private String generateEmitterId(Long userId) {
        return "sse-" + userId + "-" + System.currentTimeMillis();
    }
}