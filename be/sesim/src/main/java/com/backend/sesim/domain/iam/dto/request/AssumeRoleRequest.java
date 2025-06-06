package com.backend.sesim.domain.iam.dto.request;

import lombok.Getter;

@Getter
public class AssumeRoleRequest {
    private String roleArn;
}