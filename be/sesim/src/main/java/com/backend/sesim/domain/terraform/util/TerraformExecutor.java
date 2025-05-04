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
            builder.command("/bin/bash", "-c", command);
            builder.directory(workingDir.toFile());
            builder.redirectErrorStream(true);

            Process process = builder.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                log.info(line);
            }

            int exitCode = process.waitFor();
            log.info("Command exited with code {}", exitCode);

        } catch (Exception e) {
            log.error("명령어 실행 실패: {}", command, e);
        }
    }
}
