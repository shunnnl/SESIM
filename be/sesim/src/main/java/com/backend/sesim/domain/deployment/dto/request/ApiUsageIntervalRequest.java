package com.backend.sesim.domain.deployment.dto.request;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


@Data
@AllArgsConstructor
@Builder
public class ApiUsageIntervalRequest {

	private LocalDate startTime;
	private LocalDate endTime;
}
