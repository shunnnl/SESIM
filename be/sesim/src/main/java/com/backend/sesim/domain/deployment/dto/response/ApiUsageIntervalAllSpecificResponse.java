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
public class ApiUsageIntervalAllSpecificResponse {

	// 전체 프로젝트 요약
	private double curMonthTotalCost;
	private double lastMonthTotalCost;

	private int curMonthTotalRequests;
	private int lastMonthTotalRequests;

	private int curMonthTotalSeconds;
	private int lastMonthTotalSeconds;

	// 프로젝트별 요약 (해당 월)
	private List<ProjectRequestCountDto> projectRequestCounts;
	private List<ProjectCostDto> projectCosts;
	private List<ProjectSecondDto> projectSeconds;

	// 특정월 1일부터 1개월 동안(최신달이면 오늘날짜까지) 일일 비용 정보
	private List<DailyProjectCostDto> dailyProjectCosts;

	// 특정월 1일부터 1개월 동안(최신달이면 오늘날짜까지) 일일 API 호출 수 정보
	private List<DailyProjectRequestDto> dailyProjectRequests;

	// 특정월 1일부터 1개월 동안(최신달이면 오늘날짜까지) 일일 사용시간 정보
	private List<DailyProjectSecondDto> dailyProjectSeconds;

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
	public static class ProjectCostDto {
		private Long projectId;
		private double cost;
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
		private String date; // "yyyy-MM-dd"
		private double totalCost;
		private List<ProjectCostDto> projectCosts;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyProjectRequestDto {
		private String date;  // yyyy-MM-dd
		private int totalRequests;
		private List<ProjectRequestCountDto> projectRequests;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyProjectSecondDto {
		private String date;  // yyyy-MM-dd
		private int totalSeconds;
		private List<ProjectSecondDto> projectSeconds;
	}
}
