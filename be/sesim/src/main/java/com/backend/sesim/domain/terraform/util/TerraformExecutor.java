package com.backend.sesim.domain.terraform.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;

@Slf4j
@Component
public class TerraformExecutor {

    public void runTerraformInitAndApply(Path dirPath) {
        runCommand("terraform init", dirPath);
        runCommand("terraform apply -auto-approve", dirPath);
    }

    private void runCommand(String command, Path workingDir) {
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
            }

        } catch (Exception e) {
            log.error("명령어 실행 오류: {}", command, e);
        }
    }

    // 테라폼 설치 확인
    public boolean isTerraformInstalled() {
        try {
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            String command = isWindows ? "terraform --version" : "terraform --version";

            ProcessBuilder builder = new ProcessBuilder();
            if (isWindows) {
                builder.command("cmd.exe", "/c", command);
            } else {
                builder.command("/bin/bash", "-c", command);
            }

            Process process = builder.start();
            int exitCode = process.waitFor();

            return exitCode == 0;
        } catch (Exception e) {
            log.error("Terraform 설치 확인 실패", e);
            return false;
        }
    }
}