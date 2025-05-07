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
public class ModelFeaturesResponse {
    private Long id;
    private String name;
    private String featureTitle;
    private String featureOverview;
    private List<String> featureList;

    public static ModelFeaturesResponse from(Model model) {
        List<String> features = new ArrayList<>();
        String featureTitle = "";
        String featureOverview = "";

        // short_description을 \n으로 분리하여 처리
        if (model.getShortDescription() != null) {
            String[] featureItems = model.getShortDescription().split("\\n");

            // 첫 번째 항목이 있으면 smallTitle로 설정
            if (featureItems.length > 0 && !featureItems[0].trim().isEmpty()) {
                featureTitle = featureItems[0].trim();
            }

            // 두 번째 항목이 있으면 featureTitle로 설정
            if (featureItems.length > 1 && !featureItems[1].trim().isEmpty()) {
                featureOverview = featureItems[1].trim();
            }

            // 나머지 항목들은 featureList에 추가
            for (int i = 2; i < featureItems.length; i++) {
                if (!featureItems[i].trim().isEmpty()) {
                    features.add(featureItems[i].trim());
                }
            }
        }

        return ModelFeaturesResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .featureTitle(featureTitle)
                .featureOverview(featureOverview)
                .featureList(features)
                .build();
    }
}