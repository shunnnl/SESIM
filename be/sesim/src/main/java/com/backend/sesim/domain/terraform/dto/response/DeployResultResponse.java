package com.backend.sesim.domain.terraform.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class DeployResultResponse {
    private String deploymentId;
    private String customerId;
    private List<String> ec2PublicIps;
    private String pemKeyPath;
}