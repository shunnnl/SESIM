package com.backend.sesim.domain.deployment.service;
import com.jcraft.jsch.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.Future;

@Slf4j
@Service
@RequiredArgsConstructor
public class K3sSetupService {

    private final S3Service s3Service;
    private final SSHService sshService;

    @Value("${aws.s3.setup-bucket}")
    private String setupBucket;

    @Value("${aws.s3.setup-zip-key}")
    private String setupZipKey;

    /**
     * K3S 클러스터 설치를 비동기적으로 수행합니다.
     */
    @Async("taskExecutor")
    public Future<Boolean> setupK3sClusterAsync(List<String> publicIps, String pemKeyPath, String deploymentId, String customerId, File initSql) {
        try {
            boolean result = setupK3sCluster(publicIps, pemKeyPath, deploymentId, customerId, initSql);
            return new AsyncResult<>(result);
        } catch (Exception e) {
            log.error("비동기 K3S 클러스터 설치 실패: {}", e.getMessage(), e);
            return new AsyncResult<>(false);
        }
    }

    /**
     * K3S 클러스터 설치를 자동화합니다.
     *
     * @param publicIps EC2 인스턴스 공개 IP 목록
     * @param pemKeyPath PEM 키 파일 경로
     * @param customerId 고객 ID
     * @return 설치 결과 (성공/실패)
     */
    public boolean setupK3sCluster(List<String> publicIps, String pemKeyPath, String deploymentId, String customerId, File initSql) {
        if (publicIps == null || publicIps.isEmpty()) {
            log.error("EC2 인스턴스 IP가 제공되지 않았습니다.");
            return false;
        }

        if (publicIps.size() < 2) {
            log.error("최소 2개의 인스턴스가 필요합니다. 현재 인스턴스 수: {}", publicIps.size());
            return false;
        }

        String masterIp = publicIps.get(0);
        String workerPublicIp = publicIps.get(1);  // 워커 노드 공인 IP 직접 가져오기
        log.info("K3S 클러스터 설치 시작 - 마스터: {}, 워커: {}", masterIp, publicIps.subList(1, publicIps.size()));

        // 임시 디렉토리 경로 생성 및 pemKeyPath 수정
        String tempDir = System.getProperty("java.io.tmpdir");
        String deploymentDir = Paths.get(tempDir, "terraform", deploymentId).toString();
        String correctPemPath = Paths.get(deploymentDir, "client-key-" + deploymentId + ".pem").toString();

        log.info("임시 디렉토리: {}", tempDir);
        log.info("배포 디렉토리: {}", deploymentDir);
        log.info("PEM 키 원본 경로: {}", pemKeyPath);
        log.info("수정된 PEM 키 경로: {}", correctPemPath);

        // 파일 존재 여부 확인
        File pemFile = new File(correctPemPath);
        if (!pemFile.exists()) {
            log.error("PEM 키 파일이 존재하지 않습니다: {}", correctPemPath);
            return false;
        }

        Session session = null;
        File setupZip = null;

        try {
            // S3에서 설치 패키지 다운로드
            setupZip = s3Service.downloadFile(setupBucket, setupZipKey);
            log.info("설치 패키지 다운로드 완료: {}", setupZip.getAbsolutePath());

            // SSH 연결 설정 - 수정된 경로 사용
            session = sshService.setupSession(masterIp, "ubuntu", correctPemPath);
            log.info("SSH 연결 설정 완료: ubuntu@{}", masterIp);

            // 필요한 도구 설치
            String installCmd = "sudo apt update && sudo apt install -y unzip awscli";
            sshService.executeCommand(session, installCmd);
            log.info("필요한 도구 설치 완료");

            // AWS 리전 설정
            String configAwsCmd = "aws configure set region ap-northeast-2";
            sshService.executeCommand(session, configAwsCmd);
            log.info("AWS 리전 설정 완료");

            // 파일 전송 - 설치 패키지만 전송
            sshService.copyFile(session, setupZip.getAbsolutePath(), "setup.zip");
            log.info("설치 패키지 전송 완료");

            // 작업 디렉토리 생성 및 압축 해제
            String prepareCmd = "mkdir -p k3s-setup "
				+ "&& mv setup.zip k3s-setup/ "
				+ "&& cd k3s-setup "
				+ "&& unzip -o setup.zip ";
            sshService.executeCommand(session, prepareCmd);
            log.info("압축 해제 완료");

            // v7 디렉토리 내용 확인 및 이동
            String checkFilesCmd = "ls -la k3s-setup/v7/";
            String filesResult = sshService.executeCommand(session, checkFilesCmd);
            log.info("v7 디렉토리 내용: {}", filesResult);

            // v7 디렉토리의 파일을 k3s-setup으로 이동
            String moveFilesCmd = "cp -r k3s-setup/v7/* k3s-setup/";
            sshService.executeCommand(session, moveFilesCmd);
            log.info("파일 이동 완료");

            // 이제 PEM 키 파일을 k3s-setup 디렉토리에 직접 복사
            sshService.copyFile(session, correctPemPath, "k3s-setup/client-key-" + customerId + ".pem");
            log.info("PEM 키 파일 전송 완료");

			// 파일 전송 - initSql 전송
			sshService.copyFile(session, initSql.getAbsolutePath(), "k3s-setup/init.sql");
			log.info("init.sql 전송 완료");
            sshService.copyFile(session, initSql.getAbsolutePath(), "/home/ubuntu/init.sql");
            log.info("init.sql 전송 완료");

            // 권한 설정
            String chmodCmd = "chmod 644 /home/ubuntu/init.sql && chmod 644 k3s-setup/init.sql && chmod +x k3s-setup/*.sh && chmod 600 k3s-setup/client-key-" + customerId + ".pem";
            sshService.executeCommand(session, chmodCmd);
            log.info("권한 설정 완료");

            // 워커 노드의 프라이빗 IP 주소 - 직접 워커 노드에 접속하여 확인
            // SSH를 통해 워커 노드의 프라이빗 IP 확인
            String getWorkerPrivateIpCmd = "ssh -i k3s-setup/client-key-" + customerId + ".pem -o StrictHostKeyChecking=no ubuntu@" + workerPublicIp + " 'hostname -I | awk \"{print \\$1}\"' || echo '10.10.12.10'";
            String workerPrivateIp = sshService.executeCommand(session, getWorkerPrivateIpCmd).trim();
            log.info("워커 노드 공인 IP: {}, 프라이빗 IP: {}", workerPublicIp, workerPrivateIp);

            if (workerPrivateIp == null || workerPrivateIp.isEmpty() || workerPrivateIp.equals("null") || workerPrivateIp.equals("None")) {
                // 대체 IP - VPC의 CIDR 블록 패턴 기반 (예상값)
                workerPrivateIp = "10.10.12.10";
                log.warn("워커 노드 프라이빗 IP를 찾지 못해 기본값 사용: {}", workerPrivateIp);
            }

            // 워커 노드에도 init.sql 복사 임시용!
            String scpToWorkerCmd = String.format(
                "scp -i k3s-setup/client-key-%s.pem -o StrictHostKeyChecking=no /home/ubuntu/init.sql ubuntu@%s:/home/ubuntu/init.sql",
                customerId, workerPublicIp
            );
            sshService.executeCommand(session, scpToWorkerCmd);
            log.info("워커 노드에 init.sql 복사 완료");

            // 설치 스크립트 실행 - 경로 수정
            String setupCmd = "cd k3s-setup && ./setup_all.sh client-key-" + customerId + ".pem ubuntu " + workerPrivateIp;
            log.info("K3S 설치 명령 실행: {}", setupCmd);

            String result = sshService.executeCommand(session, setupCmd);
            log.info("K3S 설치 결과: {}", result);

            // K3s 구성 파일 권한 설정 추가
            String fixPermissionCmd = "sudo chmod 644 /etc/rancher/k3s/k3s.yaml";
            sshService.executeCommand(session, fixPermissionCmd);
            log.info("Kubernetes 구성 파일 권한 설정 완료");

            // 환경 변수 설정
            String setKubeconfigCmd = "echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> ~/.bashrc && source ~/.bashrc";
            sshService.executeCommand(session, setKubeconfigCmd);
            log.info("KUBECONFIG 환경 변수 설정 완료");

            // 설치 확인 - sudo 추가
            String verifyCmd = "sudo kubectl get nodes";
            String verifyResult = sshService.executeCommand(session, verifyCmd);
            log.info("K3S 노드 확인 결과: {}", verifyResult);

            // 설치 완료 후 PEM 키 파일 삭제 (보안)
            sshService.executeCommand(session, "rm -f k3s-setup/*.pem");

            boolean success = verifyResult.contains("Ready") || verifyResult.toLowerCase().contains(masterIp.toLowerCase());

            if (success) {
                log.info("K3S 클러스터 설치 완료 - 성공");
            } else {
                log.error("K3S 클러스터 설치 완료 - 실패");
            }

            return success;

        } catch (IOException | JSchException | SftpException e) {
            log.error("K3S 클러스터 설치 실패: {}", e.getMessage(), e);
            return false;
        } finally {
            // 세션 종료
            if (session != null) {
                try {
                    sshService.disconnect(session);
                } catch (Exception e) {
                    log.warn("세션 종료 중 오류 발생: {}", e.getMessage());
                }
            }

            // 임시 파일 정리
            if (setupZip != null && setupZip.exists()) {
                try {
                    setupZip.delete();
                    log.debug("임시 파일 삭제: {}", setupZip.getAbsolutePath());
                } catch (Exception e) {
                    log.warn("임시 파일 삭제 중 오류 발생: {}", e.getMessage());
                }
            }
        }
    }
}