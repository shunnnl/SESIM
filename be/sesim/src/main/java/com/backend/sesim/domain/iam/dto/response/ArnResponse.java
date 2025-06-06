package com.backend.sesim.domain.iam.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ArnResponse {
    private Long id;
    private String roleArn;
}