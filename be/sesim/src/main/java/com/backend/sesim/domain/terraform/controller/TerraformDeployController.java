package com.backend.sesim.domain.terraform.controller;

import com.backend.sesim.domain.terraform.dto.request.DeployRequest;
import com.backend.sesim.domain.terraform.service.TerraformDeployService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/terraform")
@RequiredArgsConstructor
public class TerraformDeployController {

    private final TerraformDeployService terraformDeployService;

    @PostMapping("/deploy")
    public String deploy(@RequestBody DeployRequest request) {
        return terraformDeployService.assumeRoleAndDeploy(request);
    }
}