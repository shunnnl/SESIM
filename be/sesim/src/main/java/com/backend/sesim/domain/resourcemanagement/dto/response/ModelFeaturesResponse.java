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
    private List<String> featureList;

    public static ModelFeaturesResponse from(Model model) {
        List<String> features = new ArrayList<>();

        // short_description을 \n으로 분리하여 featureList로 변환
        if (model.getShortDescription() != null) {
            String[] featureItems = model.getShortDescription().split("\\n");
            for (String item : featureItems) {
                if (!item.trim().isEmpty()) {
                    features.add(item.trim());
                }
            }
        }

        return ModelFeaturesResponse.builder()
                .id(model.getId())
                .name(model.getName())
                .featureList(features)
                .build();
    }
}