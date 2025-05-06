package com.backend.sesim.domain.terraform.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeployResultResponse {
    private String deploymentId;
    private String customerId;
    private List<String> ec2PublicIps;
    private String pemKeyPath;
    private boolean k3sSetupCompleted;
    private String apiEndpoint;
    private String grafanaEndpoint;
}