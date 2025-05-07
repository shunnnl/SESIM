package com.backend.sesim.domain.deployment.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class TerraformExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Terraform init 및 apply 명령을 실행합니다.
     *
     * @param dirPath 작업 디렉토리 경로
     * @return 성공 여부
     */
    public boolean runTerraformInitAndApply(Path dirPath) {
        boolean initSuccess = runCommand("terraform init", dirPath);
        if (!initSuccess) {
            log.error("Terraform init 실패");
            return false;
        }

        boolean applySuccess = runCommand("terraform apply -auto-approve", dirPath);
        if (!applySuccess) {
            log.error("Terraform apply 실패");
            return false;
        }

        return true;
    }

    /**
     * Terraform 출력값을 가져옵니다.
     *
     * @param dirPath 작업 디렉토리 경로
     * @return 출력값 맵
     */
    public Map<String, Object> getOutputs(Path dirPath) {
        Map<String, Object> outputs = new HashMap<>();
        try {
            ProcessBuilder builder = new ProcessBuilder();
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

            if (isWindows) {
                builder.command("cmd.exe", "/c", "terraform output -json");
            } else {
                builder.command("/bin/bash", "-c", "terraform output -json");
            }

            builder.directory(dirPath.toFile());
            Process process = builder.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                JsonNode outputJson = objectMapper.readTree(output.toString());

                // EC2 public IPs
                if (outputJson.has("ec2_public_ips")) {
                    JsonNode ipsNode = outputJson.get("ec2_public_ips").get("value");
                    List<String> ips = new ArrayList<>();
                    ipsNode.forEach(node -> ips.add(node.asText()));
                    outputs.put("ec2_public_ips", ips);
                }

                // PEM file path
                if (outputJson.has("pem_file_path")) {
                    outputs.put("pem_file_path", outputJson.get("pem_file_path").get("value").asText());
                }

                // Key name
                if (outputJson.has("key_name")) {
                    outputs.put("key_name", outputJson.get("key_name").get("value").asText());
                }

                // IAM instance profile
                if (outputJson.has("iam_instance_profile")) {
                    outputs.put("iam_instance_profile",
                            outputJson.get("iam_instance_profile").get("value").asText());
                }
            } else {
                log.error("Terraform output 명령 실패 (종료 코드: {})", exitCode);
            }
        } catch (Exception e) {
            log.error("Terraform output 가져오기 실패", e);
        }
        return outputs;
    }

    /**
     * 시스템 명령어를 실행합니다.
     *
     * @param command 실행할 명령어
     * @param workingDir 작업 디렉토리
     * @return 명령어 실행 성공 여부
     */
    private boolean runCommand(String command, Path workingDir) {
        try {
            ProcessBuilder builder = new ProcessBuilder();

            // OS 감지하여 적절한 명령 실행 방식 사용
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

            if (isWindows) {
                builder.command("cmd.exe", "/c", command);
            } else {
                builder.command("/bin/bash", "-c", command);
            }

            builder.directory(workingDir.toFile());
            builder.redirectErrorStream(true);

            log.info("명령어 실행: {} (디렉토리: {})", command, workingDir);
            Process process = builder.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                log.info(line);
            }

            int exitCode = process.waitFor();
            log.info("명령어 종료 코드: {}", exitCode);

            if (exitCode != 0) {
                log.error("명령어 실행 실패 (종료 코드: {}): {}", exitCode, command);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("명령어 실행 오류: {}", command, e);
            return false;
        }
    }

    /**
     * Terraform이 설치되어 있는지 확인합니다.
     *
     * @return 설치 여부
     */
    public boolean isTerraformInstalled() {
        return true;
        /*
        try {
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            String command = "terraform --version";

            ProcessBuilder builder = new ProcessBuilder();
            if (isWindows) {
                builder.command("cmd.exe", "/c", command);
            } else {
                builder.command("/bin/bash", "-c", command);
            }

            Process process = builder.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.warn("Terraform이 설치되어 있지 않습니다.");
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("Terraform 설치 확인 실패", e);
            return false;
        }

         */
    }

}