package com.backend.sesim.domain.deployment.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsageInitResponse {

	private LocalDate createdAt; // 사용자 생성 날짜

	private double totalCost; // 이번 달 총요금
	private int totalRequests; // 이번 달 총 호출 수
	private int totalSeconds; // 이번 달 사용시간

	private double lastTotalCost; // 지난달 총요금
	private int lastTotalRequests; // 지난달 총 호출 수
	private int lastTotalSeconds; // 지난달 사용시간

	private List<ProjectSummary> projects; // 해당 사용자의 프로젝트 목록
	private List<ModelSummary> models; // 해당 사용자가 사용중인 모델 목록

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ProjectSummary {
		private Long projectId;
		private String name;
		private String description;
	}

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ModelSummary {
		private Long modelId;
		private String name;
		private Double modelPricePerHour;
	}
}
