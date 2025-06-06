package com.backend.sesim.domain.resourcemanagement.dto.response;

import com.backend.sesim.domain.resourcemanagement.entity.Model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModelDetailResponse {
    private Long id;
    private String name;
    private String shortDescription;
    private String version;
    private String framework;
    private Double pricePerHour;
    private List<ModelFeatureDetailItem> features;

    public static ModelDetailResponse from(Model model) {
        // 각 특징 항목을 줄바꿈으로 분리
        String[] summaries = model.getFeatureSummary().split("\\n");
        String[] overviews = model.getFeatureOverview().split("\\n");
        String[] details = model.getFeatureDetail().split("\\n");

        // 기능 항목 리스트 생성
        List<ModelFeatureDetailItem> featureItems = new ArrayList<>();

        // 가장 짧은 배열의 길이만큼만 반복 (배열 길이가 다를 경우 대비)
        int minLength = Math.min(Math.min(summaries.length, overviews.length), details.length);

        for (int i = 0; i < minLength; i++) {
            featureItems.add(ModelFeatureDetailItem.builder()
                    .featureSummary(summaries[i].trim())
                    .featureOverview(overviews[i].trim())
                    .featureDetail(details[i].trim())
                    .build());
        }

        // shortDescription 필드에서 마지막 줄바꿈 이후의 텍스트만 추출
        String shortDesc = model.getShortDescription();
        if (shortDesc != null && !shortDesc.isEmpty()) {
            int lastNewlineIndex = shortDesc.lastIndexOf('\n');
            if (lastNewlineIndex != -1) {
                shortDesc = shortDesc.substring(lastNewlineIndex + 1).trim();
            }
        }

        return ModelDetailResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .shortDescription(shortDesc)
                .version(model.getVersion())
                .framework(model.getFramework())
                .pricePerHour(model.getModelPricePerHour())
                .features(featureItems)
                .build();
    }
}

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ModelFeatureDetailItem {
    private String featureSummary;    // 특징 요약
    private String featureOverview;   // 특징 개요
    private String featureDetail;     // 특징 상세 설명
}