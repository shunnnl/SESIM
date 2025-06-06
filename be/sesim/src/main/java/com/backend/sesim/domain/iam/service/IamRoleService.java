package com.backend.sesim.domain.iam.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.securitytoken.AWSSecurityTokenService;
import com.amazonaws.services.securitytoken.AWSSecurityTokenServiceClientBuilder;
import com.amazonaws.services.securitytoken.model.AssumeRoleRequest;
import com.amazonaws.services.securitytoken.model.AssumeRoleResult;
import com.amazonaws.services.securitytoken.model.Credentials;
import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.iam.dto.response.ArnResponse;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.domain.iam.exception.IamErrorCode;
import com.backend.sesim.domain.iam.repository.RoleArnRepository;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class IamRoleService {

    private final RoleArnRepository arnRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Value("${aws.region}")
    private String awsRegion;

    @Transactional
    public ArnResponse verifyAssumeRole(String roleArn) {
        log.info("AssumeRole 검증 시작: {}", roleArn);

        validateRoleArn(roleArn);

        try {
            // AWS SDK v1 사용
            AWSSecurityTokenService stsClient = createStsClient();
            AssumeRoleRequest request = createAssumeRoleRequest(roleArn);

            // 검증만 수행하고 값은 저장하지 않음
            stsClient.assumeRole(request);

            // 검증 성공 후 현재 로그인한 사용자의 ARN 목록에 없는 경우 추가
            Long userId = securityUtils.getCurrentUsersId();
            if (userId != null) {
                RoleArn savedArn = saveArnIfNotExists(roleArn, userId);
                // ArnResponse로 반환
                return new ArnResponse(savedArn.getId(), roleArn);
            }

            return new ArnResponse(null, roleArn);
        } catch (Exception e) {
            log.error("AssumeRole 검증 실패: {}, 오류: {}", roleArn, e.getMessage());
            throw new GlobalException(IamErrorCode.ASSUME_ROLE_FAILED);
        }
    }

    @Transactional
    public RoleArn saveArnIfNotExists(String roleArn, Long userId) {
        // 사용자 찾기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    throw new GlobalException(AuthErrorCode.USER_NOT_FOUND);
                });

        // 해당 사용자와 ARN 조합이 있는지 확인
        Optional<RoleArn> existingArn = arnRepository.findByRoleArnAndUser(roleArn, user);

        if (existingArn.isPresent()) {
            return existingArn.get();  // 이미 존재하는 ARN 반환
        }

        log.info("새 ARN 저장: {}, 사용자 ID: {}", roleArn, userId);

        RoleArn newArn = RoleArn.builder()
                .roleArn(roleArn)
                .user(user)
                .build();

        return arnRepository.save(newArn);  // 저장된 ARN 엔티티 반환
    }

    // 사용자 ARN 목록 조회
    public List<RoleArn> getUserArns() {
        Long userId = securityUtils.getCurrentUsersId();
        if (userId == null) {
            throw new GlobalException(AuthErrorCode.USER_NOT_FOUND);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    throw new GlobalException(AuthErrorCode.USER_NOT_FOUND);
                });

        return arnRepository.findAllByUser(user);
    }

    private void validateRoleArn(String roleArn) {
        if (roleArn == null || roleArn.isEmpty() || !roleArn.startsWith("arn:aws:iam::")) {
            log.warn("유효하지 않은 Role ARN: {}", roleArn);
            throw new GlobalException(IamErrorCode.INVALID_ROLE_ARN);
        }
    }

    private AWSSecurityTokenService createStsClient() {
        // AWS SDK v1 사용
        BasicAWSCredentials awsCreds = new BasicAWSCredentials(accessKey, secretKey);

        return AWSSecurityTokenServiceClientBuilder.standard()
                .withRegion(awsRegion)
                .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                .build();
    }

    private AssumeRoleRequest createAssumeRoleRequest(String roleArn) {
        return new AssumeRoleRequest()
                .withRoleArn(roleArn)
                .withRoleSessionName("SesimVerifySession")
                .withDurationSeconds(3600); // 유효 시간 1시간
    }
}