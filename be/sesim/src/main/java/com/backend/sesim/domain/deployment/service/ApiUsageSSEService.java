package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.response.ApiUsageResponse;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
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

    /**
     * 클라이언트가 SSE에 연결할 때 호출되는 메서드
     */
    public SseEmitter subscribe() {
        String emitterId = generateEmitterId();
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
     * 특정 프로젝트와 모델의 API 사용량 업데이트 알림 - 인증 없이 사용 가능
     */
    public void notifyApiUsageUpdateByProjectAndModel(Long projectId, Long modelId) {
        try {
            // 특정 프로젝트와 모델에 대한 API 사용량만 조회
            ApiUsageResponse apiUsage = projectService.getSpecificProjectModelApiUsage(projectId, modelId);

            // 모든 클라이언트에게 알림
            sendToAllEmitters("API_USAGE_UPDATE", apiUsage);
        } catch (Exception e) {
            log.error("API 사용량 업데이트 알림 실패: {}", e.getMessage());
        }
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
        return "api-usage-sse-" + System.currentTimeMillis();
    }
}