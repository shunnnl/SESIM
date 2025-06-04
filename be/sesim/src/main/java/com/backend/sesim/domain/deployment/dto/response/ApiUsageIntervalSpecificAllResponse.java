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
public class ApiUsageIntervalSpecificAllResponse {

	// 전체 요약 정보
	private double totalCost;
	private int totalRequests;
	private int totalSeconds;
	private int totalModelCount;

	// 최근 3개월 모델별 월간 총 비용
	private List<MonthModelCostDto> monthModelCosts;

	// 최근 3개월 모델별 월간 API 호출 수
	private List<MonthModelRequestDto> monthModelRequests;

	// 최근 3개월 모델별 월간 사용시간
	private List<MonthModelSecondDto> monthModelSeconds;

	// 최근 3개월 일자별 모델별 비용
	private List<DailyModelCostDto> dailyModelCosts;

	// 내부 DTO

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthModelCostDto {
		private String month; // 예: "2025-03"
		private List<ModelCostDto> modelCosts;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthModelRequestDto {
		private String month;
		private List<ModelRequestDto> modelRequests;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MonthModelSecondDto {
		private String month;
		private List<ModelSecondDto> modelSeconds;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelCostDto {
		private Long modelId;
		private double cost;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelRequestDto {
		private Long modelId;
		private int requestCount;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelSecondDto {
		private Long modelId;
		private int second;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class DailyModelCostDto {
		private String date; // yyyy-MM-dd
		private double totalCost;
		private List<ModelCostDto> modelCosts;
	}
}

