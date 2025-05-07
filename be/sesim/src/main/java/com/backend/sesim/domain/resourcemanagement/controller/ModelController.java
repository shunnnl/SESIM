package com.backend.sesim.domain.resourcemanagement.controller;

import com.backend.sesim.domain.resourcemanagement.dto.response.ModelFeaturesResponse;
import com.backend.sesim.domain.resourcemanagement.service.ModelService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/model")
@RequiredArgsConstructor
@Tag(name = "모델 컨트롤러", description = "AI 모델의 기본 정보 및 기능 목록을 제공하는 컨트롤러")
@Slf4j
public class ModelController {

    private final ModelService modelService;

    @Operation(summary = "모델 기능 목록 조회", description = "전체 모델의 기능 목록을 조회합니다.")
    @GetMapping("/features")
    public CommonResponseDto<List<ModelFeaturesResponse>> getAllModelsFeaturesList() {
        log.info("모델 기능 목록 조회 요청");
        List<ModelFeaturesResponse> features = modelService.getAllModelsFeaturesList();
        return CommonResponseDto.ok(features);
    }

}