package com.backend.sesim.domain.terraform.service;

import com.backend.sesim.domain.terraform.dto.request.DeployRequest;
import com.backend.sesim.domain.terraform.util.TerraformExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerraformDeployService {

    private final TerraformTemplateService templateService;
    private final TerraformExecutor terraformExecutor;

    public void deployToCustomerAccount(DeployRequest request) {
        // 운영체제에 맞는 임시 디렉토리 사용
        String tempDir = System.getProperty("java.io.tmpdir");
        String workingDir = Paths.get(tempDir, "terraform", request.getDeploymentId()).toString();

        log.info("작업 디렉토리: {}", workingDir);

        // 리전에 따른 AMI ID 매핑
        String amiId = getAmiIdForRegion(request.getRegion());

        try {
            // 템플릿 생성
            templateService.createTerraformFiles(
                    workingDir,
                    request.getDeploymentId(),
                    request.getRegion(),
                    request.getInstanceType(),
                    amiId,
                    request.getIamRoleArn(),
                    request.getAccessKey(),
                    request.getSecretKey(),
                    request.getSessionToken()
            );

            // Terraform 실행
            terraformExecutor.runTerraformInitAndApply(Paths.get(workingDir));

        } catch (IOException e) {
            log.error("Terraform 파일 생성 실패", e);
        }
    }

    private String getAmiIdForRegion(String region) {
        // 리전별 최신 AMI ID 매핑
        Map<String, String> regionToAmiMap = new HashMap<>();
        regionToAmiMap.put("ap-northeast-2", "ami-0898b9c266ded3337"); // 서울 리전 Ubuntu 20.04
        regionToAmiMap.put("us-east-1", "ami-0261755bbcb8c4a84");     // 버지니아 리전 Ubuntu 20.04
        regionToAmiMap.put("us-west-2", "ami-0ee8244746ec5d6d4");     // 오레곤 리전 Ubuntu 20.04
        regionToAmiMap.put("eu-west-1", "ami-0905a2ef6148f9c84");     // 아일랜드 리전 Ubuntu 20.04
        regionToAmiMap.put("ap-southeast-1", "ami-055147723b7bca09a"); // 싱가포르 리전 Ubuntu 20.04

        if (!regionToAmiMap.containsKey(region)) {
            log.warn("지원되지 않는 리전: {}. 서울 리전 AMI ID를 대신 사용합니다.", region);
            return regionToAmiMap.get("ap-northeast-2");
        }

        return regionToAmiMap.get(region);
    }
}