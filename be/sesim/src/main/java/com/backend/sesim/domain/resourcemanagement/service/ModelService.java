package com.backend.sesim.domain.resourcemanagement.service;

import com.backend.sesim.domain.resourcemanagement.dto.response.ModelFeaturesResponse;
import com.backend.sesim.domain.resourcemanagement.entity.Model;
import com.backend.sesim.domain.resourcemanagement.repository.ModelRepository;
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

    /**
     * 모든 모델의 기능 목록 조회
     */
    public List<ModelFeaturesResponse> getAllModelsFeaturesList() {
        List<Model> models = modelRepository.findAll();
        return models.stream()
                .map(ModelFeaturesResponse::from)
                .collect(Collectors.toList());
    }

}