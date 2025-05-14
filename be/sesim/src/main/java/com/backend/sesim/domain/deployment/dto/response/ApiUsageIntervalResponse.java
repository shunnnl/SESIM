package com.backend.sesim.domain.deployment.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsageIntervalResponse {

	private String userCreatedAt;
	private List<ProjectApiUsageDto> projects;

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectApiUsageDto {
		private Long projectId;
		private String projectName;
		private int projectTotalRequestCount;   // 프로젝트 총 API 요청 수 합계
		private int projectTotalSeconds;        // 프로젝트 총 사용 시간 합계
		private double projectTotalCost;		// 프로젝트 총 사용 시간 합계

		private List<ProjectIntervalDayApiUsageDto> intervalDayProjects; // 프로젝트 일별 정보
		private List<ProjectIntervalMonthApiUsageDto> intervalMonthProjects; // 프로젝트 월별 정보
		private List<ModelApiUsageDto> models; // 프로젝트에 속한 모델들 정보
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectIntervalDayApiUsageDto {
		private String date; // 일자별 날짜
		private int projectIntervalRequestCount;   // 프로젝트 기간별 API 요청 수 합계
		private int projectIntervalSeconds;   // 프로젝트 기간별 사용 시간 합계
		private double projectIntervalCost;   // 프로젝트 기간별 비용
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectIntervalMonthApiUsageDto {
		private String date; // 월별 날짜
		private int projectIntervalRequestCount;   // 프로젝트 기간별 API 요청 수 합계
		private int projectIntervalSeconds;   // 프로젝트 기간별 사용 시간 합계
		private double projectIntervalCost;   // 프로젝트 기간별 비용
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelApiUsageDto {
		private Long modelId;
		private String modelName;
		private int totalRequestCount;  // 모델별 총 API 요청 수
		private int totalSeconds;       // 모델별 총 사용 시간(초)
		private double hourlyRate;          // 모델 시간당 비용 (USD)
		private double totalCost;           // 모델 총 사용 금액 (USD)

		private List<ModelIntervalDayApiUsageDto> intervalDayModels; // 모델 일별 기간별 정보
		private List<ModelIntervalMonthApiUsageDto> intervalMonthModels; // 모델 월별 기간별 정보
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelIntervalDayApiUsageDto {
		private String date; // 일자별 날짜
		private int intervalRequestCount;  // 모델 기간별 API 요청 수
		private int intervalSeconds;       // 모델 기간별 사용 시간(초)
		private double intervalCost;		// 모델 기간별 비용
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelIntervalMonthApiUsageDto {
		private String date; // 월별 날짜
		private int intervalRequestCount;  // 모델 기간별 API 요청 수
		private int intervalSeconds;       // 모델 기간별 사용 시간(초)
		private double intervalCost;		// 모델 기간별 비용
	}
}
