package com.backend.sesim.domain.deployment.service;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.sesim.domain.auth.exception.AuthErrorCode;
import com.backend.sesim.domain.deployment.dto.request.ApiUsageIntervalRequest;
import com.backend.sesim.domain.deployment.dto.request.ApiUsageUpdateRequest;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageInitResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalAllAllResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalAllSpecificResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.ModelApiUsageDto;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.ModelIntervalDayApiUsageDto;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.ModelIntervalMonthApiUsageDto;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.ProjectApiUsageDto;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.ProjectIntervalDayApiUsageDto;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalResponse.ProjectIntervalMonthApiUsageDto;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalSpecificAllResponse;
import com.backend.sesim.domain.deployment.dto.response.ApiUsageIntervalSpecificSpecificResponse;
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
			Date endDate = Date.from(
				request.getEndTime().atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

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
					new int[] {0, 0},
					a -> new int[] {a.getTotalRequestCount(), a.getTotalSeconds()},
					(a, b) -> new int[] {a[0] + b[0], a[1] + b[1]}
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
					new int[] {0, 0},
					a -> new int[] {a.getTotalRequestCount(), a.getTotalSeconds()},
					(a, b) -> new int[] {a[0] + b[0], a[1] + b[1]}
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

	private List<ProjectIntervalMonthApiUsageDto> groupProjectByMonth(
		List<ModelIntervalMonthApiUsageDto> flatModelList) {
		return flatModelList.stream()
			.collect(Collectors.groupingBy(ModelIntervalMonthApiUsageDto::getDate))
			.entrySet().stream()
			.map(e -> {
				int reqSum = e.getValue()
					.stream()
					.mapToInt(ModelIntervalMonthApiUsageDto::getIntervalRequestCount)
					.sum();
				int secSum = e.getValue().stream().mapToInt(ModelIntervalMonthApiUsageDto::getIntervalSeconds).sum();
				double costSum = e.getValue()
					.stream()
					.mapToDouble(ModelIntervalMonthApiUsageDto::getIntervalCost)
					.sum();
				return new ProjectIntervalMonthApiUsageDto(e.getKey(), reqSum, secSum, costSum);
			})
			.sorted((a, b) -> b.getDate().compareTo(a.getDate()))
			.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public ApiUsageIntervalSpecificSpecificResponse getIntervalSpecificSpecificApiUsage(
		ApiUsageIntervalRequest request) {
		Long projectId = request.getProjectId();
		LocalDate startDate = request.getStartTime();
		LocalDate endDate = request.getEndTime();

		LocalDate lastMonthStartDate = startDate.minusMonths(1);
		LocalDate lastMonthEndDate = endDate.minusMonths(1);

		Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date end = Date.from(endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());
		Date lastStart = Date.from(lastMonthStartDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date lastEnd = Date.from(lastMonthEndDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

		List<ApiUsage> currentUsages = apiUsageRepository.findByProjectIdAndDateRange(projectId, start, end);
		List<ApiUsage> lastUsages = apiUsageRepository.findByProjectIdAndDateRange(projectId, lastStart, lastEnd);

		// 요약
		int curTotalRequests = currentUsages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int curTotalSeconds = currentUsages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
		double curTotalCost = currentUsages.stream().mapToDouble(u -> {
			double rate = u.getInformation().getModel().getModelPricePerHour()
				+ u.getInformation().getSpec().getSpecPricePerHour();
			return (u.getTotalSeconds() / 3600.0) * rate;
		}).sum();

		int lastTotalRequests = lastUsages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int lastTotalSeconds = lastUsages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
		double lastTotalCost = lastUsages.stream().mapToDouble(u -> {
			double rate = u.getInformation().getModel().getModelPricePerHour()
				+ u.getInformation().getSpec().getSpecPricePerHour();
			return (u.getTotalSeconds() / 3600.0) * rate;
		}).sum();

		// 모델별 집계
		Map<Long, List<ApiUsage>> modelGroup = currentUsages.stream()
			.collect(Collectors.groupingBy(u -> u.getInformation().getModel().getId()));

		List<ApiUsageIntervalSpecificSpecificResponse.ModelCountDto> modelRequestCounts = new ArrayList<>();
		List<ApiUsageIntervalSpecificSpecificResponse.ModelCostDto> modelCosts = new ArrayList<>();
		List<ApiUsageIntervalSpecificSpecificResponse.ModelSecondDto> modelSeconds = new ArrayList<>();

		for (Map.Entry<Long, List<ApiUsage>> entry : modelGroup.entrySet()) {
			Long modelId = entry.getKey();
			List<ApiUsage> usageList = entry.getValue();

			int totalReq = usageList.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
			int totalSec = usageList.stream().mapToInt(ApiUsage::getTotalSeconds).sum();

			ProjectModelInformation info = usageList.get(0).getInformation();
			double hourlyRate = info.getModel().getModelPricePerHour() + info.getSpec().getSpecPricePerHour();
			double totalCost = (totalSec / 3600.0) * hourlyRate;

			modelRequestCounts.add(new ApiUsageIntervalSpecificSpecificResponse.ModelCountDto(modelId, totalReq));
			modelSeconds.add(new ApiUsageIntervalSpecificSpecificResponse.ModelSecondDto(modelId, totalSec));
			modelCosts.add(new ApiUsageIntervalSpecificSpecificResponse.ModelCostDto(modelId, totalCost));
		}

		// 일별 집계
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		Map<LocalDate, List<ApiUsage>> dailyGroup = currentUsages.stream()
			.collect(Collectors.groupingBy(
				u -> u.getIntervalDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()));

		List<ApiUsageIntervalSpecificSpecificResponse.DailyModelRequestDto> dailyModelRequests = new ArrayList<>();
		List<ApiUsageIntervalSpecificSpecificResponse.DailyModelCostDto> dailyModelCosts = new ArrayList<>();
		List<ApiUsageIntervalSpecificSpecificResponse.DailyModelSecondDto> dailyModelSeconds = new ArrayList<>();

		dailyGroup.entrySet().stream()
			.sorted(Map.Entry.<LocalDate, List<ApiUsage>>comparingByKey().reversed()) // 최신순 정렬
			.forEach(entry -> {
				LocalDate date = entry.getKey();
				String dateStr = date.format(formatter);
				List<ApiUsage> usageList = entry.getValue();

				int totalReq = usageList.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
				int totalSec = usageList.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
				double totalCost = usageList.stream().mapToDouble(u -> {
					double rate = u.getInformation().getModel().getModelPricePerHour()
						+ u.getInformation().getSpec().getSpecPricePerHour();
					return (u.getTotalSeconds() / 3600.0) * rate;
				}).sum();

				Map<Long, Integer> modelRequestMap = usageList.stream()
					.collect(Collectors.groupingBy(
						u -> u.getInformation().getModel().getId(),
						Collectors.summingInt(ApiUsage::getTotalRequestCount)
					));

				Map<Long, Integer> modelSecondMap = usageList.stream()
					.collect(Collectors.groupingBy(
						u -> u.getInformation().getModel().getId(),
						Collectors.summingInt(ApiUsage::getTotalSeconds)
					));

				Map<Long, Double> modelCostMap = usageList.stream()
					.collect(Collectors.groupingBy(
						u -> u.getInformation().getModel().getId(),
						Collectors.summingDouble(u -> {
							double rate = u.getInformation().getModel().getModelPricePerHour()
								+ u.getInformation().getSpec().getSpecPricePerHour();
							return (u.getTotalSeconds() / 3600.0) * rate;
						})
					));

				List<ApiUsageIntervalSpecificSpecificResponse.ModelCountDto> modelRequestDtos = modelRequestMap.entrySet()
					.stream()
					.map(e -> new ApiUsageIntervalSpecificSpecificResponse.ModelCountDto(e.getKey(), e.getValue()))
					.collect(Collectors.toList());

				List<ApiUsageIntervalSpecificSpecificResponse.ModelSecondDto> modelSecondDtos = modelSecondMap.entrySet()
					.stream()
					.map(e -> new ApiUsageIntervalSpecificSpecificResponse.ModelSecondDto(e.getKey(), e.getValue()))
					.collect(Collectors.toList());

				List<ApiUsageIntervalSpecificSpecificResponse.ModelCostDto> modelCostDtos = modelCostMap.entrySet()
					.stream()
					.map(e -> new ApiUsageIntervalSpecificSpecificResponse.ModelCostDto(e.getKey(), e.getValue()))
					.collect(Collectors.toList());

				dailyModelRequests.add(
					new ApiUsageIntervalSpecificSpecificResponse.DailyModelRequestDto(dateStr, totalReq,
						modelRequestDtos));
				dailyModelSeconds.add(
					new ApiUsageIntervalSpecificSpecificResponse.DailyModelSecondDto(dateStr, totalSec,
						modelSecondDtos));
				dailyModelCosts.add(
					new ApiUsageIntervalSpecificSpecificResponse.DailyModelCostDto(dateStr, totalCost, modelCostDtos));
			});

		return ApiUsageIntervalSpecificSpecificResponse.builder()
			.curMonthTotalCost(curTotalCost)
			.lastMonthTotalCost(lastTotalCost)
			.curMonthTotalRequests(curTotalRequests)
			.lastMonthTotalRequests(lastTotalRequests)
			.curMonthTotalSeconds(curTotalSeconds)
			.lastMonthTotalSeconds(lastTotalSeconds)
			.modelRequestCounts(modelRequestCounts)
			.modelCosts(modelCosts)
			.modelSeconds(modelSeconds)
			.dailyModelRequests(dailyModelRequests)
			.dailyModelSeconds(dailyModelSeconds)
			.dailyModelCosts(dailyModelCosts)
			.build();
	}

	@Transactional(readOnly = true)
	public ApiUsageIntervalAllSpecificResponse getIntervalAllSpecificApiUsage(ApiUsageIntervalRequest request) {

		Long userId = securityUtils.getCurrentUsersId();
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

		List<RoleArn> roleArns = roleArnRepository.findAllByUser(user);
		List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);
		List<Long> projectIds = projects.stream().map(Project::getId).toList();

		LocalDate startDate = request.getStartTime();
		LocalDate endDate = request.getEndTime();

		LocalDate lastMonthStart = startDate.minusMonths(1);
		LocalDate lastMonthEnd = endDate.minusMonths(1);

		Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date end = Date.from(endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());
		Date lastStart = Date.from(lastMonthStart.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date lastEnd = Date.from(lastMonthEnd.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

		List<ApiUsage> currentUsages = apiUsageRepository.findByProjectIdsAndDateRange(projectIds, start, end);
		List<ApiUsage> lastUsages = apiUsageRepository.findByProjectIdsAndDateRange(projectIds, lastStart, lastEnd);

		// 전체 요약
		int curTotalRequests = currentUsages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int curTotalSeconds = currentUsages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
		double curTotalCost = currentUsages.stream().mapToDouble(u -> getUsageCost(u)).sum();

		int lastTotalRequests = lastUsages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int lastTotalSeconds = lastUsages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
		double lastTotalCost = lastUsages.stream().mapToDouble(u -> getUsageCost(u)).sum();

		// 프로젝트별 요약
		Map<Long, List<ApiUsage>> projectGroup = currentUsages.stream()
			.collect(Collectors.groupingBy(u -> u.getInformation().getProject().getId()));

		List<ApiUsageIntervalAllSpecificResponse.ProjectRequestCountDto> projectRequestCounts = new ArrayList<>();
		List<ApiUsageIntervalAllSpecificResponse.ProjectSecondDto> projectSeconds = new ArrayList<>();
		List<ApiUsageIntervalAllSpecificResponse.ProjectCostDto> projectCosts = new ArrayList<>();

		for (Map.Entry<Long, List<ApiUsage>> entry : projectGroup.entrySet()) {
			Long projectId = entry.getKey();
			List<ApiUsage> list = entry.getValue();

			int totalReq = list.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
			int totalSec = list.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
			double totalCost = list.stream().mapToDouble(this::getUsageCost).sum();

			projectRequestCounts.add(
				new ApiUsageIntervalAllSpecificResponse.ProjectRequestCountDto(projectId, totalReq));
			projectSeconds.add(new ApiUsageIntervalAllSpecificResponse.ProjectSecondDto(projectId, totalSec));
			projectCosts.add(new ApiUsageIntervalAllSpecificResponse.ProjectCostDto(projectId, totalCost));
		}

		// 일별 요약 (최신순)
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		Map<LocalDate, List<ApiUsage>> dailyGroup = currentUsages.stream()
			.collect(Collectors.groupingBy(
				u -> u.getIntervalDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()));

		List<ApiUsageIntervalAllSpecificResponse.DailyProjectRequestDto> dailyProjectRequests = new ArrayList<>();
		List<ApiUsageIntervalAllSpecificResponse.DailyProjectSecondDto> dailyProjectSeconds = new ArrayList<>();
		List<ApiUsageIntervalAllSpecificResponse.DailyProjectCostDto> dailyProjectCosts = new ArrayList<>();

		dailyGroup.entrySet().stream()
			.sorted(Map.Entry.<LocalDate, List<ApiUsage>>comparingByKey().reversed())
			.forEach(entry -> {
				LocalDate date = entry.getKey();
				String dateStr = date.format(formatter);
				List<ApiUsage> list = entry.getValue();

				int totalReq = list.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
				int totalSec = list.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
				double totalCost = list.stream().mapToDouble(this::getUsageCost).sum();

				// 프로젝트별 그룹
				Map<Long, List<ApiUsage>> dailyProjectGroup = list.stream()
					.collect(Collectors.groupingBy(u -> u.getInformation().getProject().getId()));

				List<ApiUsageIntervalAllSpecificResponse.ProjectRequestCountDto> dailyReqList = dailyProjectGroup.entrySet()
					.stream()
					.map(e -> new ApiUsageIntervalAllSpecificResponse.ProjectRequestCountDto(
						e.getKey(),
						e.getValue().stream().mapToInt(ApiUsage::getTotalRequestCount).sum()
					))
					.collect(Collectors.toList());

				List<ApiUsageIntervalAllSpecificResponse.ProjectSecondDto> dailySecList = dailyProjectGroup.entrySet()
					.stream()
					.map(e -> new ApiUsageIntervalAllSpecificResponse.ProjectSecondDto(
						e.getKey(),
						e.getValue().stream().mapToInt(ApiUsage::getTotalSeconds).sum()
					))
					.collect(Collectors.toList());

				List<ApiUsageIntervalAllSpecificResponse.ProjectCostDto> dailyCostList = dailyProjectGroup.entrySet()
					.stream()
					.map(e -> new ApiUsageIntervalAllSpecificResponse.ProjectCostDto(
						e.getKey(),
						e.getValue().stream().mapToDouble(this::getUsageCost).sum()
					))
					.collect(Collectors.toList());

				dailyProjectRequests.add(
					new ApiUsageIntervalAllSpecificResponse.DailyProjectRequestDto(dateStr, totalReq, dailyReqList));
				dailyProjectSeconds.add(
					new ApiUsageIntervalAllSpecificResponse.DailyProjectSecondDto(dateStr, totalSec, dailySecList));
				dailyProjectCosts.add(
					new ApiUsageIntervalAllSpecificResponse.DailyProjectCostDto(dateStr, totalCost, dailyCostList));
			});

		return ApiUsageIntervalAllSpecificResponse.builder()
			.curMonthTotalCost(curTotalCost)
			.lastMonthTotalCost(lastTotalCost)
			.curMonthTotalRequests(curTotalRequests)
			.lastMonthTotalRequests(lastTotalRequests)
			.curMonthTotalSeconds(curTotalSeconds)
			.lastMonthTotalSeconds(lastTotalSeconds)
			.projectRequestCounts(projectRequestCounts)
			.projectCosts(projectCosts)
			.projectSeconds(projectSeconds)
			.dailyProjectRequests(dailyProjectRequests)
			.dailyProjectSeconds(dailyProjectSeconds)
			.dailyProjectCosts(dailyProjectCosts)
			.build();
	}

	@Transactional(readOnly = true)
	public ApiUsageIntervalAllAllResponse getIntervalAllAllApiUsage(ApiUsageIntervalRequest request) {
		Long userId = securityUtils.getCurrentUsersId();
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

		List<RoleArn> roleArns = roleArnRepository.findAllByUser(user);
		List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);
		List<Long> projectIds = projects.stream().map(Project::getId).toList();

		LocalDate startDate = request.getStartTime();
		LocalDate endDate = request.getEndTime();
		Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date end = Date.from(endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

		List<ApiUsage> usages = apiUsageRepository.findByProjectIdsAndDateRange(projectIds, start, end);

		// === 전체 요약 ===
		double totalCost = usages.stream().mapToDouble(this::getUsageCost).sum();
		int totalRequests = usages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int totalSeconds = usages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
		int totalProjectCount = (int)projectIds.size();

		// === 프로젝트별 전체 비용 ===
		Map<Long, List<ApiUsage>> projectGroup = usages.stream()
			.collect(Collectors.groupingBy(u -> u.getInformation().getProject().getId()));

		List<ApiUsageIntervalAllAllResponse.ProjectCostDto> projectCosts = projectGroup.entrySet().stream()
			.map(e -> new ApiUsageIntervalAllAllResponse.ProjectCostDto(
				e.getKey(),
				e.getValue().stream().mapToDouble(this::getUsageCost).sum()
			))
			.collect(Collectors.toList());

		// === 월별 + 프로젝트별 ===
		DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");

		Map<String, Map<Long, List<ApiUsage>>> monthProjectGroup = usages.stream()
			.collect(Collectors.groupingBy(
				u -> u.getIntervalDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().format(monthFmt),
				Collectors.groupingBy(u -> u.getInformation().getProject().getId())
			));

		List<ApiUsageIntervalAllAllResponse.MonthProjectCostDto> monthProjectCosts = new ArrayList<>();
		List<ApiUsageIntervalAllAllResponse.MonthProjectRequestDto> monthProjectRequests = new ArrayList<>();
		List<ApiUsageIntervalAllAllResponse.MonthProjectSecondDto> monthProjectSeconds = new ArrayList<>();

		for (Map.Entry<String, Map<Long, List<ApiUsage>>> monthEntry : monthProjectGroup.entrySet()) {
			String month = monthEntry.getKey();
			Map<Long, List<ApiUsage>> projectMap = monthEntry.getValue();

			List<ApiUsageIntervalAllAllResponse.ProjectCostDto> costList = new ArrayList<>();
			List<ApiUsageIntervalAllAllResponse.ProjectRequestCountDto> requestList = new ArrayList<>();
			List<ApiUsageIntervalAllAllResponse.ProjectSecondDto> secondList = new ArrayList<>();

			for (Map.Entry<Long, List<ApiUsage>> entry : projectMap.entrySet()) {
				Long projectId = entry.getKey();
				List<ApiUsage> list = entry.getValue();

				costList.add(new ApiUsageIntervalAllAllResponse.ProjectCostDto(projectId,
					list.stream().mapToDouble(this::getUsageCost).sum()));
				requestList.add(new ApiUsageIntervalAllAllResponse.ProjectRequestCountDto(projectId,
					list.stream().mapToInt(ApiUsage::getTotalRequestCount).sum()));
				secondList.add(new ApiUsageIntervalAllAllResponse.ProjectSecondDto(projectId,
					list.stream().mapToInt(ApiUsage::getTotalSeconds).sum()));
			}

			monthProjectCosts.add(new ApiUsageIntervalAllAllResponse.MonthProjectCostDto(month, costList));
			monthProjectRequests.add(new ApiUsageIntervalAllAllResponse.MonthProjectRequestDto(month, requestList));
			monthProjectSeconds.add(new ApiUsageIntervalAllAllResponse.MonthProjectSecondDto(month, secondList));
		}

		// === 일자별 + 프로젝트별 비용 ===
		DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		Map<LocalDate, Map<Long, List<ApiUsage>>> dayProjectGroup = usages.stream()
			.collect(Collectors.groupingBy(
				u -> u.getIntervalDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
				Collectors.groupingBy(u -> u.getInformation().getProject().getId())
			));

		List<ApiUsageIntervalAllAllResponse.DailyProjectCostDto> dailyProjectCosts = dayProjectGroup.entrySet().stream()
			.sorted(Map.Entry.<LocalDate, Map<Long, List<ApiUsage>>>comparingByKey().reversed())
			.map(entry -> {
				String date = entry.getKey().format(dayFmt);
				Map<Long, List<ApiUsage>> projectMap = entry.getValue();

				double totalDayCost = projectMap.values().stream()
					.flatMap(List::stream)
					.mapToDouble(this::getUsageCost).sum();

				List<ApiUsageIntervalAllAllResponse.ProjectCostDto> perProject = projectMap.entrySet().stream()
					.map(e -> new ApiUsageIntervalAllAllResponse.ProjectCostDto(e.getKey(),
						e.getValue().stream().mapToDouble(this::getUsageCost).sum()))
					.collect(Collectors.toList());

				return new ApiUsageIntervalAllAllResponse.DailyProjectCostDto(date, totalDayCost, perProject);
			})
			.collect(Collectors.toList());

		return ApiUsageIntervalAllAllResponse.builder()
			.totalCost(totalCost)
			.totalRequests(totalRequests)
			.totalSeconds(totalSeconds)
			.totalProjectCount(totalProjectCount)
			.projectCosts(projectCosts)
			.monthProjectCosts(monthProjectCosts)
			.monthProjectRequests(monthProjectRequests)
			.monthProjectSeconds(monthProjectSeconds)
			.dailyProjectCosts(dailyProjectCosts)
			.build();
	}

	@Transactional(readOnly = true)
	public ApiUsageIntervalSpecificAllResponse getIntervalSpecificAllApiUsage(ApiUsageIntervalRequest request) {
		Long projectId = request.getProjectId();
		LocalDate startDate = request.getStartTime();
		LocalDate endDate = request.getEndTime();

		Date start = Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date end = Date.from(endDate.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

		List<ApiUsage> usages = apiUsageRepository.findByProjectIdAndDateRange(projectId, start, end);

		// === 전체 요약 ===
		double totalCost = usages.stream().mapToDouble(this::getUsageCost).sum();
		int totalRequests = usages.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int totalSeconds = usages.stream().mapToInt(ApiUsage::getTotalSeconds).sum();
		int totalModelCount = (int)usages.stream()
			.map(u -> u.getInformation().getModel().getId())
			.distinct()
			.count();

		// === 월별 + 모델별 ===
		DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");

		Map<String, Map<Long, List<ApiUsage>>> monthModelGroup = usages.stream()
			.collect(Collectors.groupingBy(
				u -> u.getIntervalDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().format(monthFmt),
				Collectors.groupingBy(u -> u.getInformation().getModel().getId())
			));

		List<ApiUsageIntervalSpecificAllResponse.MonthModelCostDto> monthModelCosts = new ArrayList<>();
		List<ApiUsageIntervalSpecificAllResponse.MonthModelRequestDto> monthModelRequests = new ArrayList<>();
		List<ApiUsageIntervalSpecificAllResponse.MonthModelSecondDto> monthModelSeconds = new ArrayList<>();

		for (Map.Entry<String, Map<Long, List<ApiUsage>>> monthEntry : monthModelGroup.entrySet()) {
			String month = monthEntry.getKey();
			Map<Long, List<ApiUsage>> modelMap = monthEntry.getValue();

			List<ApiUsageIntervalSpecificAllResponse.ModelCostDto> costList = new ArrayList<>();
			List<ApiUsageIntervalSpecificAllResponse.ModelRequestDto> reqList = new ArrayList<>();
			List<ApiUsageIntervalSpecificAllResponse.ModelSecondDto> secList = new ArrayList<>();

			for (Map.Entry<Long, List<ApiUsage>> entry : modelMap.entrySet()) {
				Long modelId = entry.getKey();
				List<ApiUsage> list = entry.getValue();

				costList.add(new ApiUsageIntervalSpecificAllResponse.ModelCostDto(modelId,
					list.stream().mapToDouble(this::getUsageCost).sum()));
				reqList.add(new ApiUsageIntervalSpecificAllResponse.ModelRequestDto(modelId,
					list.stream().mapToInt(ApiUsage::getTotalRequestCount).sum()));
				secList.add(new ApiUsageIntervalSpecificAllResponse.ModelSecondDto(modelId,
					list.stream().mapToInt(ApiUsage::getTotalSeconds).sum()));
			}

			monthModelCosts.add(new ApiUsageIntervalSpecificAllResponse.MonthModelCostDto(month, costList));
			monthModelRequests.add(new ApiUsageIntervalSpecificAllResponse.MonthModelRequestDto(month, reqList));
			monthModelSeconds.add(new ApiUsageIntervalSpecificAllResponse.MonthModelSecondDto(month, secList));
		}

		// === 일별 + 모델별 비용 ===
		DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		Map<LocalDate, Map<Long, List<ApiUsage>>> dayModelGroup = usages.stream()
			.collect(Collectors.groupingBy(
				u -> u.getIntervalDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
				Collectors.groupingBy(u -> u.getInformation().getModel().getId())
			));

		List<ApiUsageIntervalSpecificAllResponse.DailyModelCostDto> dailyModelCosts = dayModelGroup.entrySet().stream()
			.sorted(Map.Entry.<LocalDate, Map<Long, List<ApiUsage>>>comparingByKey().reversed())
			.map(entry -> {
				String date = entry.getKey().format(dayFmt);
				Map<Long, List<ApiUsage>> modelMap = entry.getValue();

				double totalCostPerDay = modelMap.values().stream()
					.flatMap(List::stream)
					.mapToDouble(this::getUsageCost)
					.sum();

				List<ApiUsageIntervalSpecificAllResponse.ModelCostDto> perModel = modelMap.entrySet().stream()
					.map(e -> new ApiUsageIntervalSpecificAllResponse.ModelCostDto(
						e.getKey(),
						e.getValue().stream().mapToDouble(this::getUsageCost).sum()
					))
					.collect(Collectors.toList());

				return new ApiUsageIntervalSpecificAllResponse.DailyModelCostDto(date, totalCostPerDay, perModel);
			})
			.collect(Collectors.toList());

		return ApiUsageIntervalSpecificAllResponse.builder()
			.totalCost(totalCost)
			.totalRequests(totalRequests)
			.totalSeconds(totalSeconds)
			.totalModelCount(totalModelCount)
			.monthModelCosts(monthModelCosts)
			.monthModelRequests(monthModelRequests)
			.monthModelSeconds(monthModelSeconds)
			.dailyModelCosts(dailyModelCosts)
			.build();
	}

	@Transactional(readOnly = true)
	public ApiUsageInitResponse getInitApiUsage() {
		Long userId = securityUtils.getCurrentUsersId();
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new GlobalException(AuthErrorCode.USER_NOT_FOUND));

		List<RoleArn> roleArns = roleArnRepository.findAllByUser(user);
		List<Project> projects = projectRepository.findAllByRoleArnIn(roleArns);
		List<Long> projectIds = projects.stream().map(Project::getId).toList();

		LocalDate now = LocalDate.now();
		LocalDate startOfMonth = now.withDayOfMonth(1);
		LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
		LocalDate endOfLastMonth = startOfMonth.minusDays(1);

		Date thisMonthStart = Date.from(startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date nowDate = Date.from(now.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());
		Date lastMonthStart = Date.from(startOfLastMonth.atStartOfDay(ZoneId.systemDefault()).toInstant());
		Date lastMonthEnd = Date.from(endOfLastMonth.atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant());

		// 이번 달과 지난달 데이터 조회
		List<ApiUsage> thisMonthUsage = apiUsageRepository.findByProjectIdsAndDateRange(projectIds, thisMonthStart,
			nowDate);
		List<ApiUsage> lastMonthUsage = apiUsageRepository.findByProjectIdsAndDateRange(projectIds, lastMonthStart,
			lastMonthEnd);

		// 이번 달 요약
		double totalCost = thisMonthUsage.stream().mapToDouble(this::getUsageCost).sum();
		int totalRequests = thisMonthUsage.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int totalSeconds = thisMonthUsage.stream().mapToInt(ApiUsage::getTotalSeconds).sum();

		// 지난 달 요약
		double lastTotalCost = lastMonthUsage.stream().mapToDouble(this::getUsageCost).sum();
		int lastTotalRequests = lastMonthUsage.stream().mapToInt(ApiUsage::getTotalRequestCount).sum();
		int lastTotalSeconds = lastMonthUsage.stream().mapToInt(ApiUsage::getTotalSeconds).sum();

		// 프로젝트 + 모델 정보 정리
		List<ApiUsageInitResponse.ProjectSummary> projectSummaries = projects.stream().map(project -> {
			List<ApiUsageInitResponse.ModelSummary> models = project.getModelInformations().stream()
				.map(info -> ApiUsageInitResponse.ModelSummary.builder()
					.modelId(info.getModel().getId())
					.name(info.getModel().getName())
					.modelPricePerHour(info.getModel().getModelPricePerHour())
					.build())
				.toList();

			return ApiUsageInitResponse.ProjectSummary.builder()
				.projectId(project.getId())
				.name(project.getName())
				.description(project.getDescription())
				.models(models)
				.build();
		}).toList();

		return ApiUsageInitResponse.builder()
			.createdAt(user.getCreatedAt().toLocalDate())
			.totalCost(totalCost)
			.totalRequests(totalRequests)
			.totalSeconds(totalSeconds)
			.lastTotalCost(lastTotalCost)
			.lastTotalRequests(lastTotalRequests)
			.lastTotalSeconds(lastTotalSeconds)
			.projects(projectSummaries)
			.build();
	}

	private double getUsageCost(ApiUsage u) {
		double rate = u.getInformation().getModel().getModelPricePerHour()
			+ u.getInformation().getSpec().getSpecPricePerHour();
		return (u.getTotalSeconds() / 3600.0) * rate;
	}
}