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
public class ApiUsageIntervalAllAllResponse {

	// 전체 요약 정보
	private double totalCost;
	private int totalRequests;
	private int totalSeconds;
	private int totalProjectCount;

	// 프로젝트별 전체기간 비용 요약
	private List<ProjectCostDto> projectCosts;

	// 월별 프로젝트별 비용 요약
	private List<MonthProjectCostDto> monthProjectCosts;

	// 월별 프로젝트별 API 호출 수 요약
	private List<MonthProjectRequestDto> monthProjectRequests;

	// 월별 프로젝트별 사용 시간
	private List<MonthProjectSecondDto> monthProjectSeconds;

	// 일자별 프로젝트별 비용
	private List<DailyProjectCostDto> dailyProjectCosts;


	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthProjectCostDto {
		private String month; // 예: "2025-03"
		private List<ProjectCostDto> projectCosts;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthProjectRequestDto {
		private String month; // 예: "2025-03"
		private List<ProjectRequestCountDto> projectRequests;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthProjectSecondDto {
		private String month;
		private List<ProjectSecondDto> projectSeconds;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectCostDto {
		private Long projectId;
		private double cost;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectRequestCountDto {
		private Long projectId;
		private int requestCount;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectSecondDto {
		private Long projectId;
		private int second;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyProjectCostDto {
		private String date; // 예: "2025-03-01"
		private double totalCost;
		private List<ProjectCostDto> projectCosts;
	}
}
