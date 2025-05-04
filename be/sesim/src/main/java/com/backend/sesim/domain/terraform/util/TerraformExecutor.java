package com.backend.sesim.domain.terraform.util;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;

@Slf4j
public class TerraformExecutor {

    public static String runWithCredentials(String dirPath, AwsSessionCredentials creds) {
        StringBuilder output = new StringBuilder();

        try {
            ProcessBuilder initBuilder = new ProcessBuilder("terraform", "init");
            ProcessBuilder applyBuilder = new ProcessBuilder("terraform", "apply", "-auto-approve");

            Map<String, String> env = initBuilder.environment(); // 환경변수에 넣기
            env.put("AWS_ACCESS_KEY_ID", creds.accessKeyId());
            env.put("AWS_SECRET_ACCESS_KEY", creds.secretAccessKey());
            env.put("AWS_SESSION_TOKEN", creds.sessionToken());

            initBuilder.directory(new java.io.File(dirPath));
            applyBuilder.directory(new java.io.File(dirPath));
            applyBuilder.environment().putAll(env);

            output.append(runCommand(initBuilder));
            output.append(runCommand(applyBuilder));

        } catch (Exception e) {
            log.error("Terraform 실행 실패", e);
            return "Terraform 실행 오류: " + e.getMessage();
        }

        return output.toString();
    }

    private static String runCommand(ProcessBuilder builder) throws Exception {
        Process process = builder.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            result.append(line).append("\n");
        }
        process.waitFor();
        return result.toString();
    }
}
