package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.request.ApiUsageUpdateRequest;
import com.backend.sesim.domain.deployment.entity.ApiUsage;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.DeploymentErrorCode;
import com.backend.sesim.domain.deployment.repository.ApiUsageRepository;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiUsageService {

    private final ApiUsageRepository apiUsageRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final ApiUsageSSEService apiUsageSSEService; // 별도의 SSE 서비스 주입

    /**
     * API 사용량 업데이트 또는 새로 생성
     */
    @Transactional
    public void updateApiUsage(ApiUsageUpdateRequest request) {
        // DTO 객체에서 필드 추출
        Long projectId = request.getProjectId();
        Long modelId = request.getModelId();
        String apiName = request.getApiName();
        int totalRequestCount = request.getTotalRequestCount();
        int totalSeconds = request.getTotalSeconds();

        // 프로젝트 ID와 모델 ID로 ProjectModelInformation 찾기
        ProjectModelInformation modelInfo = projectModelInfoRepository.findByProjectIdAndModelId(projectId, modelId)
                .orElseThrow(() -> {
                    log.error("프로젝트 ID: {}와 모델 ID: {}에 해당하는 정보를 찾을 수 없음", projectId, modelId);
                    return new GlobalException(DeploymentErrorCode.MODEL_INFO_NOT_FOUND);
                });

        // 모델 정보 ID와 API 이름으로 기존 사용량 조회
        Long informationId = modelInfo.getId();
        boolean isUpdated = false;

        // Optional<ApiUsage> existingUsage = apiUsageRepository.findByInformationIdAndApiName(informationId, apiName);

        // 비관적 락을 사용한 조회
        Optional<ApiUsage> existingUsage = apiUsageRepository.findByInformationIdAndApiNameWithLock(informationId, apiName);

        if (existingUsage.isPresent()) {
            // 기존 사용량이 있으면 새 값으로 완전히 대체
            ApiUsage usage = existingUsage.get();

            // 값이 변경되었는지 확인
            if (usage.getTotalRequestCount() != totalRequestCount ||
                    usage.getTotalSeconds() != totalSeconds) {

                usage.updateCounts(totalRequestCount, totalSeconds);
                apiUsageRepository.save(usage);
                isUpdated = true;

                log.info("API 사용량 덮어쓰기: projectId={}, modelId={}, apiName={}, 총 요청={}회, 총 시간={}초",
                        projectId, modelId, apiName, totalRequestCount, totalSeconds);
            }
        } else {
            // 없으면 새로 생성
            ApiUsage newUsage = ApiUsage.builder()
                    .information(modelInfo)
                    .apiName(apiName)
                    .totalRequestCount(totalRequestCount)
                    .totalSeconds(totalSeconds)
                    .build();
            apiUsageRepository.save(newUsage);
            isUpdated = true;

            log.info("API 사용량 새로 생성: projectId={}, modelId={}, apiName={}, 요청={}회, 시간={}초",
                    projectId, modelId, apiName, totalRequestCount, totalSeconds);
        }

        // 변경사항이 있는 경우에만 SSE 알림 전송
        if (isUpdated) {
            // 업데이트 알림(변경)
            apiUsageSSEService.notifyApiUsageUpdateByProjectAndModel(projectId, modelId);
        }
    }
}