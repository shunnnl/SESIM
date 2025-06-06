package com.backend.sesim.domain.resourcemanagement.service;

import com.backend.sesim.domain.resourcemanagement.dto.response.CodeExampleResponse;
import com.backend.sesim.domain.resourcemanagement.dto.response.ModelDetailResponse;
import com.backend.sesim.domain.resourcemanagement.dto.response.ModelFeaturesResponse;
import com.backend.sesim.domain.resourcemanagement.entity.ApiExample;
import com.backend.sesim.domain.resourcemanagement.entity.Model;
import com.backend.sesim.domain.resourcemanagement.exception.ResourcemanagementErrorCode;
import com.backend.sesim.domain.resourcemanagement.repository.ApiExampleRepository;
import com.backend.sesim.domain.resourcemanagement.repository.ModelRepository;
import com.backend.sesim.global.exception.GlobalException;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModelService {

    private final ModelRepository modelRepository;
    private final ApiExampleRepository apiExampleRepository;

    /**
     * 모든 모델의 기능 목록 조회
     */
    public List<ModelFeaturesResponse> getAllModelsFeaturesList() {
        List<Model> models = modelRepository.findAll();
        return models.stream()
                .map(ModelFeaturesResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 모델의 상세 정보 조회
     */
    public ModelDetailResponse getModelDetail(Long modelId) {
        Model model = modelRepository.findById(modelId)
                .orElseThrow(() -> new GlobalException(ResourcemanagementErrorCode.MODEL_NOT_FOUND));
        return ModelDetailResponse.from(model);
    }

    /**
     * SDK 다운로드 코드를 조회합니다.
     * 모든 모델에 공통으로 적용되는 단일 예제 코드를 반환합니다.
     */
    public CodeExampleResponse getSdkDownloadCode() {
        ApiExample apiExample = apiExampleRepository.findFirstByOrderByIdDesc();

        if (apiExample == null) {
            throw new GlobalException(ResourcemanagementErrorCode.API_EXAMPLE_NOT_FOUND);
        }

        return CodeExampleResponse.from(apiExample.getCodeExample());
    }
}