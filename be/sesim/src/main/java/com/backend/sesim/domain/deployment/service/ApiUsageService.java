package com.backend.sesim.domain.deployment.service;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.deployment.dto.request.ApiUsageIntervalRequest;
import com.backend.sesim.domain.deployment.dto.request.ApiUsageUpdateRequest;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.*;
import com.backend.sesim.domain.deployment.entity.ApiUsage;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiUsageService {

    private final ApiUsageRepository apiUsageRepository;
    private final ProjectModelInfoRepository projectModelInfoRepository;
    private final ApiUsageSSEService apiUsageSSEService; // 별도의 SSE 서비스 주입
    private final SecurityUtils securityUtils;
    private final RoleArnRepository roleArnRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    /**
     * API 사용량 업데이트 또는 새로 생성
     */
    @Transactional
    public void updateApiUsage(ApiUsageUpdateRequest request) {
        // DTO 객체에서 필드 추출
        Long projectId = request.getProjectId();
        Long modelId = request.getModelId();
        String apiName = request.getApiName();
        int totalRequestCount = request.getTotalRequestCount();
        int totalSeconds = request.getTotalSeconds();
        Date intervalDate = Date.from((request.getIntervalDate()).atStartOfDay(ZoneId.systemDefault()).toInstant());

        // 프로젝트 ID와 모델 ID로 ProjectModelInformation 찾기
        ProjectModelInformation modelInfo = projectModelInfoRepository.findByProjectIdAndModelId(projectId, modelId)
                .orElseThrow(() -> {
                    log.error("프로젝트 ID: {}와 모델 ID: {}에 해당하는 정보를 찾을 수 없음", projectId, modelId);
                    return new GlobalException(DeploymentErrorCode.MODEL_INFO_NOT_FOUND);
                });

        // 모델 정보 ID와 API 이름으로 기존 사용량 조회
        Long informationId = modelInfo.getId();
        boolean isUpdated = false;

        // Optional<ApiUsage> existingUsage = apiUsageRepository.findByInformationIdAndApiName(informationId, apiName);

        // 비관적 락을 사용한 조회
        Optional<ApiUsage> existingUsage = apiUsageRepository.findByInfoIdAndApiNameAndIntervalDateWithLock(
            informationId, apiName, intervalDate);

        // 2. 있으면 업데이트
        if (existingUsage.isPresent()) {
            ApiUsage usage = existingUsage.get();

            if (usage.getTotalRequestCount() != totalRequestCount || usage.getTotalSeconds() != totalSeconds) {
                usage.updateCounts(totalRequestCount, totalSeconds);
                apiUsageRepository.save(usage);
                isUpdated = true;

                log.info("API 사용량 덮어쓰기: projectId={}, modelId={}, apiName={}, intervalDate={}, 요청={}, 시간={}, 간격={}",
                    projectId, modelId, apiName, intervalDate, totalRequestCount, totalSeconds, intervalDate);
            }
        } else {
            // 3. 없으면 새로 생성
            ApiUsage newUsage = ApiUsage.builder()
                .information(modelInfo)
                .apiName(apiName)
                .totalRequestCount(totalRequestCount)
                .totalSeconds(totalSeconds)
                .intervalDate(intervalDate)
                .build();
            apiUsageRepository.save(newUsage);
            isUpdated = true;

            log.info("API 사용량 새로 생성: projectId={}, modelId={}, apiName={}, intervalDate={}, 요청={}, 시간={}, 간격={}",
                projectId, modelId, apiName, intervalDate, totalRequestCount, totalSeconds, intervalDate);
        }

        // 변경사항이 있는 경우에만 SSE 알림 전송
        if (isUpdated) {
            // 업데이트 알림(변경)
            apiUsageSSEService.notifyApiUsageUpdateByProjectAndModel(projectId, modelId);
        }
    }

    @Transactional
    public ApiUsageIntervalResponse getIntervalApiUsage(ApiUsageIntervalRequest request) {
        Long userId = securityUtils.getCurrentUsersId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

        List<RoleArn> roleArns = roleArnRepository.findAllByUser(user);
        List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);

        List<ProjectApiUsageDto> projectDtos = new ArrayList<>();

        for (Project project : projects) {
            int projectTotalRequestCount = 0;
            int projectTotalSeconds = 0;
            double projectTotalCost = 0;

            List<ModelApiUsageDto> modelDtos = new ArrayList<>();
            List<ModelIntervalDayApiUsageDto> allDayUsages = new ArrayList<>();
            List<ModelIntervalMonthApiUsageDto> allMonthUsages = new ArrayList<>();

            Date startDate = Date.from(request.getStartTime().atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date endDate = Date.from(request.getEndTime().atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

            for (ProjectModelInformation info : project.getModelInformations()) {
                Long infoId = info.getId();

                List<ApiUsage> usages = apiUsageRepository.findByInfoIdAndIntervalDateBetween(
                    infoId,
                    startDate,
                    endDate
                );

                int totalReq = usages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
                int totalSec = usages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
                double hourlyRate = info.getModel().getModelPricePerHour() + info.getSpec().getSpecPricePerHour();
                double totalCost = (totalSec / 3600.0) * hourlyRate;

                List<ModelIntervalDayApiUsageDto> modelDayList = groupByDay(usages, hourlyRate);
                List<ModelIntervalMonthApiUsageDto> modelMonthList = groupByMonth(usages, hourlyRate);
                allDayUsages.addAll(modelDayList);
                allMonthUsages.addAll(modelMonthList);

                modelDtos.add(ModelApiUsageDto.builder()
                    .modelId(info.getModel().getId())
                    .modelName(info.getModel().getName())
                    .totalRequestCount(totalReq)
                    .totalSeconds(totalSec)
                    .hourlyRate(hourlyRate)
                    .totalCost(totalCost)
                    .intervalDayModels(modelDayList)
                    .intervalMonthModels(modelMonthList)
                    .build());

                projectTotalRequestCount += totalReq;
                projectTotalSeconds += totalSec;
                projectTotalCost += totalCost;
            }

            projectDtos.add(ProjectApiUsageDto.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .projectTotalRequestCount(projectTotalRequestCount)
                .projectTotalSeconds(projectTotalSeconds)
                .projectTotalCost(projectTotalCost)
                .intervalDayProjects(groupProjectByDay(allDayUsages))
                .intervalMonthProjects(groupProjectByMonth(allMonthUsages))
                .models(modelDtos)
                .build());
        }

        return ApiUsageIntervalResponse.builder()
            .userCreatedAt(user.getCreatedAt().toString())
            .projects(projectDtos)
            .build();
    }


    private List<ModelIntervalDayApiUsageDto> groupByDay(List<ApiUsage> usages, double hourlyRate) {
        return usages.stream()
            .collect(Collectors.groupingBy(
                a -> new SimpleDateFormat("yyyy-MM-dd").format(a.getIntervalDate()),
                Collectors.reducing(
                    new int[]{0, 0},
                    a -> new int[]{a.getTotalRequestCount(), a.getTotalSeconds()},
                    (a, b) -> new int[]{a[0] + b[0], a[1] + b[1]}
                )
            ))
            .entrySet().stream()
            .map(e -> new ModelIntervalDayApiUsageDto(
                e.getKey(),
                e.getValue()[0],
                e.getValue()[1],
                (e.getValue()[1] / 3600.0) * hourlyRate
            ))
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());
    }

    private List<ModelIntervalMonthApiUsageDto> groupByMonth(List<ApiUsage> usages, double hourlyRate) {
        return usages.stream()
            .collect(Collectors.groupingBy(
                a -> new SimpleDateFormat("yyyy-MM").format(a.getIntervalDate()),
                Collectors.reducing(
                    new int[]{0, 0},
                    a -> new int[]{a.getTotalRequestCount(), a.getTotalSeconds()},
                    (a, b) -> new int[]{a[0] + b[0], a[1] + b[1]}
                )
            ))
            .entrySet().stream()
            .map(e -> new ModelIntervalMonthApiUsageDto(
                e.getKey(),
                e.getValue()[0],
                e.getValue()[1],
                (e.getValue()[1] / 3600.0) * hourlyRate
            ))
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());
    }

    private List<ProjectIntervalDayApiUsageDto> groupProjectByDay(List<ModelIntervalDayApiUsageDto> flatModelList) {
        return flatModelList.stream()
            .collect(Collectors.groupingBy(ModelIntervalDayApiUsageDto::getDate))
            .entrySet().stream()
            .map(e -> {
                int reqSum = e.getValue().stream().mapToInt(ModelIntervalDayApiUsageDto::getIntervalRequestCount).sum();
                int secSum = e.getValue().stream().mapToInt(ModelIntervalDayApiUsageDto::getIntervalSeconds).sum();
                double costSum = e.getValue().stream().mapToDouble(ModelIntervalDayApiUsageDto::getIntervalCost).sum();
                return new ProjectIntervalDayApiUsageDto(e.getKey(), reqSum, secSum, costSum);
            })
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());
    }

    private List<ProjectIntervalMonthApiUsageDto> groupProjectByMonth(List<ModelIntervalMonthApiUsageDto> flatModelList) {
        return flatModelList.stream()
            .collect(Collectors.groupingBy(ModelIntervalMonthApiUsageDto::getDate))
            .entrySet().stream()
            .map(e -> {
                int reqSum = e.getValue().stream().mapToInt(ModelIntervalMonthApiUsageDto::getIntervalRequestCount).sum();
                int secSum = e.getValue().stream().mapToInt(ModelIntervalMonthApiUsageDto::getIntervalSeconds).sum();
                double costSum = e.getValue().stream().mapToDouble(ModelIntervalMonthApiUsageDto::getIntervalCost).sum();
                return new ProjectIntervalMonthApiUsageDto(e.getKey(), reqSum, secSum, costSum);
            })
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());
    }

}