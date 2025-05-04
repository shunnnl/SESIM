package com.backend.sesim.domain.terraform.service;

import com.backend.sesim.domain.terraform.dto.request.DeployRequest;
import com.backend.sesim.domain.terraform.util.TerraformExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TerraformDeployService {

    private final TerraformTemplateService templateService;
    private final TerraformExecutor terraformExecutor;

    public void deployToCustomerAccount(DeployRequest request) {
        String workingDir = "/tmp/terraform/" + request.getDeploymentId();

        try {
            // 템플릿 생성
            templateService.createTerraformFiles(
                    workingDir,
                    request.getDeploymentId(),
                    request.getRegion(),
                    request.getInstanceType(),
                    request.getAmiId(),
                    "role-not-used-here",
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
}