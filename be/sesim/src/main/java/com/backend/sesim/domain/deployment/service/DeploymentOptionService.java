package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.deployment.dto.response.DeployOptionsResponse;
import com.backend.sesim.domain.resourcemanagement.entity.InfrastructureSpec;
import com.backend.sesim.domain.resourcemanagement.repository.InfrastructureSpecRepository;
import com.backend.sesim.domain.resourcemanagement.entity.Model;
import com.backend.sesim.domain.resourcemanagement.repository.ModelRepository;
import com.backend.sesim.domain.resourcemanagement.entity.Region;
import com.backend.sesim.domain.resourcemanagement.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentOptionService {

    private final RegionRepository regionRepository;
    private final InfrastructureSpecRepository infrastructureSpecRepository;
    private final ModelRepository modelRepository;

    @Transactional(readOnly = true)
    public DeployOptionsResponse getDeployOptions() {
        // 리전 정보 조회 (이제 상태와 관계없이 모든 리전 조회)
        List<Region> regions = regionRepository.findAll();
        List<DeployOptionsResponse.RegionOptionDto> regionOptions = regions.stream()
                .map(region -> DeployOptionsResponse.RegionOptionDto.builder()
                        .id(region.getId())
                        .name(region.getName())
                        .code(region.getCode())
                        .build())
                .collect(Collectors.toList());

        // 인프라 스펙 정보 조회
        List<InfrastructureSpec> specs = infrastructureSpecRepository.findAll();
        List<DeployOptionsResponse.InfrastructureSpecOptionDto> specOptions = specs.stream()
                .map(spec -> DeployOptionsResponse.InfrastructureSpecOptionDto.builder()
                        .id(spec.getId())
                        .ec2Spec(spec.getEc2Spec())
                        .ec2Info(spec.getEc2Info())
                        .specPricePerHour(spec.getSpecPricePerHour())
                        .build())
                .collect(Collectors.toList());

        // 모델 정보 조회
        List<Model> models = modelRepository.findAll();
        List<DeployOptionsResponse.ModelOptionDto> modelOptions = models.stream()
                .map(model -> {

                    String firstDescription = "";
                    if (model.getShortDescription() != null && !model.getShortDescription().isEmpty()) {
                        String[] descriptionLines = model.getShortDescription().split("\\n");
                        if (descriptionLines.length > 0) {
                            firstDescription = descriptionLines[0];
                        }
                    }

                    return DeployOptionsResponse.ModelOptionDto.builder()
                            .id(model.getId())
                            .name(model.getName())
                            .description(firstDescription)
                            .version(model.getVersion())
                            .framework(model.getFramework())
                            .modelPricePerHour(model.getModelPricePerHour())
                            .build();
                })
                .collect(Collectors.toList());

        // 모든 모델과 인프라 스펙 조합에 대한 가격 정보 생성
        List<DeployOptionsResponse.CombinedPriceInfoDto> combinedPrices = new ArrayList<>();

        for (Model model : models) {
            for (InfrastructureSpec spec : specs) {
                // 두 가격을 합한 총 가격 계산
                Double totalPrice = model.getModelPricePerHour() + spec.getSpecPricePerHour();

                combinedPrices.add(
                        DeployOptionsResponse.CombinedPriceInfoDto.builder()
                                .modelId(model.getId())
                                .specId(spec.getId())
                                .totalPricePerHour(totalPrice)
                                .build()
                );
            }
        }

        // 모든 정보를 담은 통합 응답 생성
        return DeployOptionsResponse.builder()
                .regions(regionOptions)
                .infrastructureSpecs(specOptions)
                .models(modelOptions)
                .combinedPrices(combinedPrices)
                .build();
    }
}