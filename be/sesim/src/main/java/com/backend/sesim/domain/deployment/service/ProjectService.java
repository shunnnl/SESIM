package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.deployment.dto.request.ApiKeyCheckRequest;
import com.backend.sesim.domain.deployment.dto.response.ApiKeyResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageResponse;
import com.backend.sesim.domain.deployment.dto.response.ProjectDeploymentResponse;
import com.backend.sesim.domain.deployment.dto.response.ProjectListResponse;
import com.backend.sesim.domain.deployment.entity.Project;
import com.backend.sesim.domain.deployment.entity.ProjectModelInformation;
import com.backend.sesim.domain.deployment.exception.DeploymentErrorCode;
import com.backend.sesim.domain.deployment.repository.ApiUsageRepository;
import com.backend.sesim.domain.deployment.repository.ProjectModelInfoRepository;
import com.backend.sesim.domain.deployment.repository.ProjectRepository;
import com.backend.sesim.domain.iam.entity.RoleArn;
import com.backend.sesim.domain.iam.repository.RoleArnRepository;
import com.backend.sesim.domain.user.entity.User;
import com.backend.sesim.domain.user.repository.UserRepository;
import com.backend.sesim.global.exception.GlobalException;
import com.backend.sesim.global.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final RoleArnRepository roleArnRepository;
    private final UserRepository userRepository;
    private final ApiUsageRepository apiUsageRepository;
    private final SecurityUtils securityUtils;

    /**
     * 현재 로그인한 사용자의 프로젝트 목록 조회
     */
    public ProjectListResponse getUserProjects() {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        // 사용자 정보 조회
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 사용자의 RoleArn 목록 조회
        List<RoleArn> roleArns = roleArnRepository.findAllByUser(currentUser);

        // RoleArn에 해당하는 프로젝트 목록 조회
        List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);

        // 응답 DTO 변환
        return ProjectListResponse.from(projects);
    }

    /**
     * 현재 로그인한 사용자의 프로젝트 배포 상태 조회
     */
    public ProjectDeploymentResponse getProjectDeploymentStatus() {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        // 사용자 정보 조회
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 사용자의 RoleArn 목록 조회
        List<RoleArn> roleArns = roleArnRepository.findAllByUser(currentUser);

        // RoleArn에 해당하는 프로젝트 목록 조회
        List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);

        // 응답 DTO 변환
        return ProjectDeploymentResponse.from(projects);
    }

    @Transactional
    public ApiKeyResponse checkAndGetApiKey(ApiKeyCheckRequest request) {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        // 사용자 정보 조회
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 프로젝트 모델 정보 조회
        ProjectModelInformation modelInfo = projectModelInfoRepository
                .findByProjectIdAndModelId(request.getProjectId(), request.getModelId())
                .orElseThrow(() -> new GlobalException(DeploymentErrorCode.MODEL_INFO_NOT_FOUND));

        // 사용자 접근 권한 확인 (프로젝트 소유자인지)
        if (!modelInfo.getProject().getRoleArn().getUser().getId().equals(userId)) {
            throw new GlobalException(DeploymentErrorCode.UNAUTHORIZED_PROJECT_ACCESS);
        }

        // API 키가 이미 확인된 경우 체크
        if (modelInfo.getIsApiKeyCheck()) {
            throw new GlobalException(DeploymentErrorCode.API_KEY_ALREADY_CHECKED);
        }

        // API 키 확인 상태 업데이트
        modelInfo.checkModelApiKey(modelInfo.getModelApiKey());

        // 응답 생성
        return ApiKeyResponse.builder()
                .apiKey(modelInfo.getModelApiKey())
                .build();
    }


    /**
     * 현재 로그인한 사용자의 모든 프로젝트 API 사용량 조회
     */
    public ApiUsageResponse getAllUserProjectsApiUsage() {
        // 현재 로그인한 사용자 ID 가져오기
        Long userId = securityUtils.getCurrentUsersId();

        // 사용자 정보 조회
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        // 사용자의 RoleArn 목록 조회
        List<RoleArn> roleArns = roleArnRepository.findAllByUser(currentUser);

        // RoleArn에 해당하는 프로젝트 목록 조회
        List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);


        // 사용자의 모든 프로젝트에 대한 API 사용량 정보 수집
        List<ApiUsageResponse.ProjectApiUsageDto> projectApiUsages = projects.stream()
                .map(project -> {
                    int projectTotalRequestCount = 0;
                    int projectTotalSeconds = 0;
                    double projectTotalCost = 0.0;

                    // 프로젝트에 포함된 모델별 API 사용량 조회
                    List<ApiUsageResponse.ModelApiUsageDto> modelUsages = project.getModelInformations().stream()
                            .map(modelInfo -> {
                                // COALESCE를 사용하여 NULL을 0으로 처리
                                int modelRequestCount = apiUsageRepository.sumTotalRequestCountByInformationId(modelInfo.getId());
                                int modelSeconds = apiUsageRepository.sumTotalSecondsByInformationId(modelInfo.getId());

                                // 시간당 비용 (모델 비용 + 인프라 비용)
                                double modelHourlyRate = modelInfo.getModel().getModelPricePerHour() +
                                        modelInfo.getSpec().getSpecPricePerHour();

                                // 초를 시간으로 변환하여 비용 계산 (3600초 = 1시간)
                                double modelTotalCost = (modelSeconds / 3600.0) * modelHourlyRate;

                                return ApiUsageResponse.ModelApiUsageDto.builder()
                                        .modelId(modelInfo.getModel().getId())
                                        .modelName(modelInfo.getModel().getName())
                                        .totalRequestCount(modelRequestCount)
                                        .totalSeconds(modelSeconds)
                                        .hourlyRate(modelHourlyRate)
                                        .totalCost(modelTotalCost)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    // 프로젝트 내 모든 모델의 API 사용량 합계 계산
                    for (ApiUsageResponse.ModelApiUsageDto model : modelUsages) {
                        projectTotalRequestCount += model.getTotalRequestCount();
                        projectTotalSeconds += model.getTotalSeconds();
                        projectTotalCost += model.getTotalCost();
                    }

                    return ApiUsageResponse.ProjectApiUsageDto.builder()
                            .projectId(project.getId())
                            .projectName(project.getName())
                            .projectTotalRequestCount(projectTotalRequestCount)
                            .projectTotalSeconds(projectTotalSeconds)
                            .projectTotalCost(projectTotalCost)
                            .models(modelUsages)
                            .build();
                })
                .collect(Collectors.toList());

        // 응답 생성
        return ApiUsageResponse.builder()
                .projects(projectApiUsages)
                .build();
    }

}