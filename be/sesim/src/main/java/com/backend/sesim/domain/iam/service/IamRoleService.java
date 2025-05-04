package com.backend.sesim.domain.iam.service;

import com.backend.sesim.domain.iam.dto.response.RoleVerificationResponse;
import com.backend.sesim.domain.iam.exception.IamErrorCode;
import com.backend.sesim.global.exception.GlobalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sts.StsClient;
import software.amazon.awssdk.services.sts.model.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class IamRoleService {

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Value("${aws.region}")
    private String awsRegion;

    public RoleVerificationResponse verifyAssumeRole(String roleArn) {
        log.info("AssumeRole 검증 시작: {}", roleArn);

        validateRoleArn(roleArn);

        try (StsClient stsClient = createStsClient()) {
            AssumeRoleRequest request = createAssumeRoleRequest(roleArn);
            RoleVerificationResponse response = executeAssumeRole(stsClient, request);

            log.info("AssumeRole 검증 완료: {}", roleArn);
            return response;
        } catch (StsException e) {
            log.error("AssumeRole 검증 실패: {}, 오류: {}", roleArn, e.getMessage());
            throw new GlobalException(IamErrorCode.ASSUME_ROLE_FAILED);
        }
    }

    private void validateRoleArn(String roleArn) {
        if (roleArn == null || roleArn.isEmpty() || !roleArn.startsWith("arn:aws:iam::")) {
            log.warn("유효하지 않은 Role ARN: {}", roleArn);
            throw new GlobalException(IamErrorCode.INVALID_ROLE_ARN);
        }
    }

    private StsClient createStsClient() {
        return StsClient.builder()
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        )
                )
                .region(Region.of(awsRegion))
                .build();
    }

    private AssumeRoleRequest createAssumeRoleRequest(String roleArn) {
        return AssumeRoleRequest.builder()
                .roleArn(roleArn)
                .roleSessionName("SesimVerifySession")
                .durationSeconds(3600) // 유효 시간 수정
                .build();
    }

    private RoleVerificationResponse executeAssumeRole(StsClient stsClient, AssumeRoleRequest request) {
        AssumeRoleResponse stsResponse = stsClient.assumeRole(request);

        Credentials creds = stsResponse.credentials();

        if (creds != null) {
            log.info("⏰ Expiration: {}", creds.expiration());

            return new RoleVerificationResponse(
                    stsResponse.credentials().accessKeyId(),
                    stsResponse.credentials().secretAccessKey(),
                    stsResponse.credentials().sessionToken()
            );
        } else {
            log.warn("자격 증명을 찾을 수 없음: {}", request.roleArn());
            throw new GlobalException(IamErrorCode.CREDENTIALS_NOT_FOUND);
        }
    }
}