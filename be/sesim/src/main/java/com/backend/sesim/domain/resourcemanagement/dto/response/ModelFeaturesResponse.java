package com.backend.sesim.domain.resourcemanagement.dto.response;

import com.backend.sesim.domain.resourcemanagement.entity.Model;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class ModelFeaturesDTO {
    private Long id;
    private String name;
    private List<String> featureList = new ArrayList<>();

    public ModelFeaturesDTO(Model model) {
        this.id = model.getId();
        this.name = model.getName();

        // short_description을 \n으로 분리하여 featureList로 변환
        if (model.getShortDescription() != null) {
            String[] featureItems = model.getShortDescription().split("\\n");
            for (String item : featureItems) {
                if (!item.trim().isEmpty()) {
                    this.featureList.add(item.trim());
                }
            }
        }
    }
}