package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.response.ApiUsageResponse;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.global.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ApiUsageSSEService {

    private static final Long DEFAULT_TIMEOUT = 60 * 60 * 1000L; // 1시간
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ProjectService projectService;
    private final SecurityUtils securityUtils;
    private final ProjectRepository projectRepository;

    /**
     * 클라이언트가 SSE에 연결할 때 호출되는 메서드
     */
    public SseEmitter subscribe() {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        String emitterId = generateEmitterId(userId);
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        emitters.put(emitterId, emitter);
        log.info("새로운 API 사용량 SSE 연결 생성: {}", emitterId);

        // 연결 종료 시 emitter 제거
        emitter.onCompletion(() -> {
            emitters.remove(emitterId);
            log.info("API 사용량 SSE 연결 완료: {}", emitterId);
        });

        emitter.onTimeout(() -> {
            emitters.remove(emitterId);
            log.info("API 사용량 SSE 연결 타임아웃: {}", emitterId);
        });

        emitter.onError((e) -> {
            emitters.remove(emitterId);
            log.error("API 사용량 SSE 연결 에러: {}", emitterId, e);
        });

        // 연결 직후 초기 상태 전송
        try {
            sendInitialStatus(emitter);
            // 연결 확인용 이벤트 전송
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected to API usage stream!"));
        } catch (IOException e) {
            emitters.remove(emitterId);
            log.error("API 사용량 초기 데이터 전송 실패: {}", emitterId, e);
        }

        return emitter;
    }

    /**
     * 초기 API 사용량 데이터를 전송
     */
    private void sendInitialStatus(SseEmitter emitter) throws IOException {
        ApiUsageResponse apiUsage = projectService.getAllUserProjectsApiUsage();
        emitter.send(SseEmitter.event()
                .name("INIT")
                .data(apiUsage));
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
     * 특정 프로젝트와 모델의 API 사용량 업데이트 알림 - 인증 없이 사용 가능
     */
    public void notifyApiUsageUpdateByProjectAndModel(Long projectId, Long modelId) {
        try {
            // 프로젝트 소유자 ID 조회
            Long ownerId = getProjectOwnerId(projectId);
            if (ownerId == null) {
                log.warn("프로젝트 소유자를 찾을 수 없음, API 사용량 업데이트 알림 전송 건너뜀: {}", projectId);
                return;
            }

            // 특정 프로젝트와 모델에 대한 API 사용량만 조회
            ApiUsageResponse apiUsage = projectService.getSpecificProjectModelApiUsage(projectId, modelId);

            // 프로젝트 소유자의 클라이언트에게만 알림 전송
            sendToUserEmitters(ownerId, "API_USAGE_UPDATE", apiUsage);
        } catch (Exception e) {
            log.error("API 사용량 업데이트 알림 실패: {}", e.getMessage());
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
        String userPrefix = "api-usage-sse-" + userId + "-";
        boolean sent = false;

        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            String emitterId = entry.getKey();
            if (emitterId.startsWith(userPrefix)) {
                try {
                    entry.getValue().send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                    sent = true;
                    log.debug("API 사용량 이벤트 {} 전송 성공: {}", eventName, emitterId);
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
     * 고유한 이미터 ID 생성 (사용자 ID 포함)
     */
    private String generateEmitterId(Long userId) {
        return "api-usage-sse-" + userId + "-" + System.currentTimeMillis();
    }
}