package com.backend.sesim.domain.terraform.service;

import com.backend.sesim.domain.terraform.dto.request.DeployRequest;
import com.backend.sesim.domain.terraform.util.TerraformExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest;
import software.amazon.awssdk.services.sts.model.AssumeRoleResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class TerraformDeployService {

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    public String assumeRoleAndDeploy(DeployRequest request) {
        try (StsClient stsClient = StsClient.builder()
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of(request.getRegion()))
                .build()) {

            AssumeRoleRequest assumeRequest = AssumeRoleRequest.builder()
                    .roleArn(request.getRoleArn())
                    .roleSessionName("SesimDeploySession")
                    .durationSeconds(3600)
                    .build();

            AssumeRoleResponse response = stsClient.assumeRole(assumeRequest);

            AwsSessionCredentials tempCredentials = AwsSessionCredentials.create(
                    response.credentials().accessKeyId(),
                    response.credentials().secretAccessKey(),
                    response.credentials().sessionToken()
            );

            log.info("임시 credentials 확보 완료, 배포 시작");
            return TerraformExecutor.runWithCredentials(request.getTerraformDir(), tempCredentials);

        } catch (Exception e) {
            log.error("Terraform 배포 실패", e);
            return "Terraform 배포 실패: " + e.getMessage();
        }
    }
}