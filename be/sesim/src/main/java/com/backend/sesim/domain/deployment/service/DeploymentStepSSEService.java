package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.response.DeploymentStatusUpdateResponse;
import com.backend.sesim.domain.deployment.dto.response.ProjectStatusResponse;
import com.backend.sesim.domain.deployment.entity.DeploymentStep;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.repository.DeploymentStepRepository;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.transaction.annotation.Transactional;
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

    /**
     * 클라이언트가 SSE에 연결할 때 호출되는 메서드
     */
    @Transactional(readOnly = true) // 추가
    public SseEmitter subscribe() {
        String emitterId = generateEmitterId();
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
        List<ProjectStatusResponse> statuses = getAllProjectsStatus();
        emitter.send(SseEmitter.event()
                .name("INIT")
                .data(statuses));
    }

    /**
     * 모든 프로젝트의 배포 상태를 조회
     */
    @Transactional(readOnly = true) // 추가
    protected List<ProjectStatusResponse> getAllProjectsStatus() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream()
                .map(this::convertToProjectStatusDTO)
                .collect(Collectors.toList());
    }

    /**
     * 프로젝트를 ProjectStatusResponse로 변환
     */
    @Transactional(readOnly = true) // 추가
    protected ProjectStatusResponse convertToProjectStatusDTO(Project project) {
        List<DeploymentStep> steps = deploymentStepRepository.findByProjectIdOrderByStepOrder(project.getId());

        // 2. 프로젝트 모델 정보 조회 (ProjectModelInfoRepository 주입 필요)
        List<ProjectModelInformation> modelInfos = projectModelInfoRepository.findByProjectId(project.getId());

        return ProjectStatusResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .albAddress(project.getAlbAddress())
                .steps(steps.stream()
                        .map(step -> new ProjectStatusResponse.StepStatus(
                                step.getId(),
                                step.getStepOrder(),
                                step.getStepName(),
                                step.getStepStatus()))
                        .collect(Collectors.toList()))
                .models(modelInfos.stream()
                        .map(modelInfo -> new ProjectStatusResponse.ModelInfo(
                                modelInfo.getModel().getId(),
                                modelInfo.getModel().getName(),
                                modelInfo.getIsApiKeyCheck()))
                        .collect(Collectors.toList()))
                .build();
    }


    /**
     * 배포 상태가 업데이트될 때 모든 클라이언트에게 알림
     */
    @Transactional(readOnly = true)  // 여기에 @Transactional 어노테이션 추가
    public void notifyDeploymentStatusUpdate(DeploymentStep step) {
        // 1. step에서 projectId만 가져옴 (이 부분은 LazyInitializationException이 발생하지 않음)
        Long projectId = step.getProject().getId();

        // 2. 새로운 트랜잭션에서 프로젝트 정보를 다시 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없음: " + projectId));

        // 3. 프로젝트 상태 DTO 생성
        ProjectStatusResponse projectStatus = convertToProjectStatusDTO(project);

        // 4. 업데이트 DTO 생성
        DeploymentStatusUpdateResponse updateDTO = DeploymentStatusUpdateResponse.builder()
                .projectId(projectId)
                .projectStatus(projectStatus)
                .stepId(step.getId())
                .stepStatus(step.getStepStatus())
                .stepName(step.getStepName())
                .build();

        // 5. 모든 연결된 클라이언트에게 이벤트 전송
        sendToAllEmitters("STATUS_UPDATE", updateDTO);
        log.info("배포 상태 업데이트 전송: 프로젝트={}, 스텝={}, 상태={}",
                projectId, step.getId(), step.getStepStatus());
    }

    /**
     * 모든 이미터에 이벤트 전송
     */
    private <T> void sendToAllEmitters(String eventName, T data) {
        emitters.forEach((id, emitter) -> {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (IOException e) {
                log.error("이벤트 전송 실패: {}", id, e);
                emitters.remove(id);
            }
        });
    }

    /**
     * 고유한 이미터 ID 생성
     */
    private String generateEmitterId() {
        return "sse-" + System.currentTimeMillis();
    }
}