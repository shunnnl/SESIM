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

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiUsageService {

    private final ApiUsageRepository apiUsageRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;

    /**
     * API 사용량 업데이트 또는 새로 생성
     */
    @Transactional
    public void updateApiUsage(ApiUsageUpdateRequest request) {
        // DTO 객체에서 필드 추출
        Long informationId = request.getInformationId();
        String apiName = request.getApiName();
        int requestCount = request.getRequestCount();
        int seconds = request.getSeconds();

        // 모델 정보 확인
        ProjectModelInformation modelInfo = projectModelInfoRepository.findById(informationId)
                .orElseThrow(() -> new GlobalException(DeploymentErrorCode.MODEL_INFO_NOT_FOUND));

        // 기존 사용량 조회
        Optional<ApiUsage> existingUsage = apiUsageRepository.findByInformationIdAndApiName(informationId, apiName);

        if (existingUsage.isPresent()) {
            // 기존 사용량이 있으면 새 값으로 완전히 대체
            ApiUsage usage = existingUsage.get();
            usage.updateCounts(requestCount, seconds);  // 누적이 아닌 덮어쓰기
            apiUsageRepository.save(usage);
            log.info("API 사용량 덮어쓰기: informationId={}, apiName={}, 총 요청={}회, 총 시간={}초",
                    informationId, apiName, requestCount, seconds);
        } else {
            // 없으면 새로 생성
            ApiUsage newUsage = ApiUsage.builder()
                    .information(modelInfo)
                    .apiName(apiName)
                    .totalRequestCount(requestCount)
                    .totalSeconds(seconds)
                    .build();
            apiUsageRepository.save(newUsage);
            log.info("API 사용량 새로 생성: informationId={}, apiName={}, 요청={}회, 시간={}초",
                    informationId, apiName, requestCount, seconds);
        }
    }
}