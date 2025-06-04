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
public class ApiUsageIntervalSpecificSpecificResponse {

	// 요약 정보
	private double curMonthTotalCost;           // 특정 월의 비용
	private double lastMonthTotalCost;          // 지난 달 총 비용

	private int curMonthTotalRequests;     // 특정 월 API 요청 수
	private int lastMonthTotalRequests;         // 지난 달 API 요청 수

	private int curMonthTotalSeconds;      // 특정 월 사용 시간
	private int lastMonthTotalSeconds;          // 지난 달 사용 시간

	// 모델별 집계 정보
	private List<ModelCountDto> modelRequestCounts; // 특정 월 모델별 전체 API 호출 수
	private List<ModelCostDto> modelCosts;          // 특정 월 모델별 전체 비용
	private List<ModelSecondDto> modelSeconds;        // 특정 월 모델별 전체 사용 시간

	// 특정월 1일부터 1개월 동안(최신달이면 오늘날짜까지) 일일 비용 정보
	private List<DailyModelCostDto> dailyModelCosts;

	// 특정월 1일부터 1개월 동안(최신달이면 오늘날짜까지) 일일 API 호출 수 정보
	private List<DailyModelRequestDto> dailyModelRequests;

	// 특정월 1일부터 1개월 동안(최신달이면 오늘날짜까지) 일일 사용시간 정보
	private List<DailyModelSecondDto> dailyModelSeconds;

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelCountDto {
		private Long modelId;
		private int requestCount; // 특정 월에 해당하는 모델 전체 호출 수
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelCostDto {
		private Long modelId;
		private double cost; // 특정 월에 해당하는 모델 전체 비용
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelSecondDto {
		private Long modelId;
		private int second; // 특정 월에 해당하는 모델 전체 사용시간
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyModelCostDto {
		private String date;  // yyyy-MM-dd
		private double totalCost;
		private List<ModelCostDto> modelCosts;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyModelRequestDto {
		private String date;  // yyyy-MM-dd
		private int totalRequests;
		private List<ModelCountDto> modelRequests;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyModelSecondDto {
		private String date;  // yyyy-MM-dd
		private int totalSeconds;
		private List<ModelSecondDto> modelSeconds;
	}
}
