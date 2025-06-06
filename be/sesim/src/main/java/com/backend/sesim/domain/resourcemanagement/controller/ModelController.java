package com.backend.sesim.domain.resourcemanagement.controller;

import com.backend.sesim.domain.resourcemanagement.dto.response.CodeExampleResponse;
import com.backend.sesim.domain.resourcemanagement.dto.response.ModelDetailResponse;
import com.backend.sesim.domain.resourcemanagement.dto.response.ModelFeaturesResponse;
import com.backend.sesim.domain.resourcemanagement.service.ModelService;
import com.backend.sesim.global.dto.CommonResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/model")
@RequiredArgsConstructor
@Tag(name = "모델 컨트롤러", description = "AI 모델의 기본 정보 및 목록을 제공하는 컨트롤러")
@Slf4j
public class ModelController {

    private final ModelService modelService;

    @Operation(summary = "모델 리스트 조회", description = "전체 모델의 목록을 조회합니다.")
    @GetMapping("/features")
    public CommonResponseDto<List<ModelFeaturesResponse>> getAllModelsFeaturesList() {
        List<ModelFeaturesResponse> features = modelService.getAllModelsFeaturesList();
        return CommonResponseDto.ok(features);
    }

    @Operation(summary = "모델 상세 정보 조회", description = "특정 모델의 상세 정보와 기능 세부 내용을 조회합니다.")
    @GetMapping("/{modelId}")
    public CommonResponseDto<ModelDetailResponse> getModelDetail(@PathVariable Long modelId) {
        ModelDetailResponse modelDetail = modelService.getModelDetail(modelId);
        return CommonResponseDto.ok(modelDetail);
    }

    @Operation(summary = "모델 사용 예시 코드 조회", description = "모든 모델에 공통으로 적용되는 다운로드 코드를 조회합니다.")
    @GetMapping("/sdk-download-code")
    public CommonResponseDto<CodeExampleResponse> getSdkDownloadCode() {
        CodeExampleResponse codeExample = modelService.getSdkDownloadCode();
        return CommonResponseDto.ok(codeExample);
    }

}