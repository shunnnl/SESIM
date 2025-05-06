package com.backend.sesim.domain.terraform.service;

import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PreDestroy;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Slf4j
@Service
public class SSHService {

    @Value("${ssh.connection-timeout:60000}")
    private int connectionTimeout;

    @Value("${ssh.channel-timeout:30000}")
    private int channelTimeout;

    // 현재 활성화된 SSH 세션을 추적하기 위한 맵
    private final Map<String, Session> activeSessions = new ConcurrentHashMap<>();

    // 애플리케이션 종료 중인지 확인하는 플래그
    private final AtomicBoolean isShuttingDown = new AtomicBoolean(false);

    /**
     * SSH 연결 세션을 설정합니다.
     *
     * @param host 호스트 IP 주소
     * @param username 사용자 이름
     * @param pemKeyPath PEM 키 파일 경로
     * @return JSch 세션
     * @throws JSchException SSH 연결 오류 발생 시
     */
    public Session setupSession(String host, String username, String pemKeyPath) throws JSchException {
        log.info("SSH 연결 설정: {}@{}", username, host);

        // 이미 종료 중이면 새 연결을 시작하지 않음
        if (isShuttingDown.get()) {
            throw new JSchException("애플리케이션이 종료 중입니다. 새 SSH 연결을 설정할 수 없습니다.");
        }

        // PEM 키 파일 검증
        File pemFile = new File(pemKeyPath);
        if (!pemFile.exists()) {
            log.error("PEM 키 파일이 존재하지 않습니다: {}", pemKeyPath);
            throw new JSchException("PEM 키 파일을 찾을 수 없습니다: " + pemKeyPath);
        }

        // 절대 경로 사용
        String absolutePemPath = pemFile.getAbsolutePath();
        log.info("절대 경로 PEM 키: {}", absolutePemPath);

        JSch jsch = new JSch();
        jsch.addIdentity(absolutePemPath);

        Session session = jsch.getSession(username, host, 22);
        session.setConfig("StrictHostKeyChecking", "no");
        session.setConfig("PreferredAuthentications", "publickey");

        // 추가 연결 설정 - 포크된 JSch 버전에서 지원하는 추가 옵션
        session.setConfig("kex", "diffie-hellman-group1-sha1,diffie-hellman-group14-sha1,diffie-hellman-group-exchange-sha1,diffie-hellman-group-exchange-sha256,ecdh-sha2-nistp256,ecdh-sha2-nistp384,ecdh-sha2-nistp521,curve25519-sha256,curve25519-sha256@libssh.org");
        session.setConfig("server_host_key", "ssh-ed25519,ssh-rsa,ssh-dss,ecdsa-sha2-nistp256,ecdsa-sha2-nistp384,ecdsa-sha2-nistp521");
        session.setConfig("compression.s2c", "zlib,none");
        session.setConfig("compression.c2s", "zlib,none");

        // 타임아웃 설정 확장
        session.setTimeout(connectionTimeout);

        // 연결 재시도 설정
        int maxRetries = 10;         // 최대 10번 시도
        int retryInterval = 30000;   // 30초 간격
        int connectTimeout = 60000;  // 60초 연결 타임아웃

        // 초기 대기 시간 (3분) - EC2 인스턴스가 초기화될 시간
        log.info("EC2 인스턴스 초기화 대기 중... (3분)");
        try {
            // 강제 중단 가능성 확인
            for (int i = 0; i < 18; i++) { // 3분을 10초 간격으로 분할
                if (isShuttingDown.get() || Thread.currentThread().isInterrupted()) {
                    throw new InterruptedException("애플리케이션 종료로 인한 대기 중단");
                }
                Thread.sleep(10000); // 10초씩 대기
                log.debug("EC2 인스턴스 초기화 대기 중... ({}/18)", i+1);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("대기 중 인터럽트 발생", e);
            throw new JSchException("SSH 연결 중 인터럽트 발생", e);
        }

        JSchException lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            // 강제 중단 가능성 확인
            if (isShuttingDown.get() || Thread.currentThread().isInterrupted()) {
                throw new JSchException("애플리케이션 종료로 SSH 연결 취소");
            }

            try {
                log.info("SSH 연결 시도 {}/{}: {}@{}", attempt, maxRetries, username, host);
                session.connect(connectTimeout);
                log.info("SSH 연결 성공: {}@{}", username, host);

                // 성공한 세션 추적
                String sessionKey = username + "@" + host;
                activeSessions.put(sessionKey, session);

                return session;
            } catch (JSchException e) {
                lastException = e;
                log.warn("SSH 연결 실패 (시도 {}/{}): {}", attempt, maxRetries, e.getMessage());

                if (attempt < maxRetries) {
                    try {
                        log.info("{}초 후 재시도합니다...", retryInterval/1000);

                        // 강제 중단 가능성 확인
                        for (int i = 0; i < retryInterval/1000; i++) {
                            if (isShuttingDown.get() || Thread.currentThread().isInterrupted()) {
                                throw new InterruptedException("애플리케이션 종료로 인한 재시도 중단");
                            }
                            Thread.sleep(1000); // 1초씩 대기
                        }
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new JSchException("SSH 연결 중 인터럽트 발생", ie);
                    }
                }
            }
        }

        log.error("최대 재시도 횟수({})를 초과했습니다. SSH 연결 실패", maxRetries);
        throw lastException != null ? lastException : new JSchException("SSH 연결 실패: 알 수 없는 오류");
    }

    /**
     * 원격 서버에 파일을 전송합니다.
     *
     * @param session SSH 세션
     * @param localPath 로컬 파일 경로
     * @param remotePath 원격 파일 경로
     * @throws JSchException SSH 연결 오류 발생 시
     * @throws SftpException 파일 전송 오류 발생 시
     */
    public void copyFile(Session session, String localPath, String remotePath) throws JSchException, SftpException {
        log.info("파일 전송: {} -> {}:{}", localPath, session.getHost(), remotePath);

        // 종료 중이면 작업 취소
        if (isShuttingDown.get() || Thread.currentThread().isInterrupted()) {
            throw new JSchException("애플리케이션 종료로 인한 파일 전송 취소");
        }

        Channel channel = null;
        ChannelSftp sftpChannel = null;

        try {
            channel = session.openChannel("sftp");
            channel.connect(channelTimeout);

            sftpChannel = (ChannelSftp) channel;
            sftpChannel.put(localPath, remotePath);

            log.info("파일 전송 완료: {}", remotePath);
        } finally {
            if (sftpChannel != null) sftpChannel.exit();
            if (channel != null) channel.disconnect();
        }
    }

    /**
     * 원격 서버에서 명령을 실행합니다.
     *
     * @param session SSH 세션
     * @param command 실행할 명령어
     * @return 명령 실행 결과
     * @throws JSchException SSH 연결 오류 발생 시
     * @throws IOException 명령 실행 결과 읽기 오류 발생 시
     */
    public String executeCommand(Session session, String command) throws JSchException, IOException {
        log.info("명령 실행: {} (서버: {})", command, session.getHost());

        // 종료 중이면 작업 취소
        if (isShuttingDown.get() || Thread.currentThread().isInterrupted()) {
            throw new JSchException("애플리케이션 종료로 인한 명령 실행 취소");
        }

        Channel channel = null;
        ChannelExec execChannel = null;

        try {
            channel = session.openChannel("exec");
            execChannel = (ChannelExec) channel;
            execChannel.setCommand(command);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ByteArrayOutputStream errorStream = new ByteArrayOutputStream();

            execChannel.setOutputStream(outputStream);
            execChannel.setErrStream(errorStream);

            InputStream in = execChannel.getInputStream();
            execChannel.connect(channelTimeout);

            byte[] tmp = new byte[1024];
            StringBuilder resultBuilder = new StringBuilder();

            while (true) {
                // 인터럽트 체크
                if (isShuttingDown.get() || Thread.currentThread().isInterrupted()) {
                    throw new JSchException("애플리케이션 종료로 인한 명령 실행 중단");
                }

                while (in.available() > 0) {
                    int i = in.read(tmp, 0, 1024);
                    if (i < 0) break;
                    resultBuilder.append(new String(tmp, 0, i));
                }

                if (execChannel.isClosed()) {
                    int exitStatus = execChannel.getExitStatus();
                    log.info("명령 종료 코드: {}", exitStatus);
                    if (exitStatus != 0) {
                        log.warn("명령 실행 실패: {} (종료 코드: {})", command, exitStatus);
                        log.warn("오류 출력: {}", errorStream.toString());
                    }
                    break;
                }

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new JSchException("명령 실행 중 인터럽트 발생", e);
                }
            }

            String result = resultBuilder.toString();
            log.debug("명령 실행 결과: {}", result);
            return result;

        } finally {
            if (channel != null) channel.disconnect();
        }
    }

    /**
     * 연결된 세션을 종료합니다.
     *
     * @param session 종료할 SSH 세션
     */
    public void disconnect(Session session) {
        if (session != null && session.isConnected()) {
            String sessionKey = session.getUserName() + "@" + session.getHost();
            try {
                session.disconnect();
                log.info("SSH 연결 종료: {}@{}", session.getUserName(), session.getHost());
            } finally {
                activeSessions.remove(sessionKey);
            }
        }
    }

    /**
     * 애플리케이션 종료 시 모든 SSH 세션을 정리합니다.
     */
    @PreDestroy
    public void cleanupOnShutdown() {
        log.info("SSH 서비스 종료 중 - 모든 세션 정리");
        isShuttingDown.set(true);

        // 모든 활성 세션 종료
        for (Session session : activeSessions.values()) {
            try {
                if (session != null && session.isConnected()) {
                    session.disconnect();
                    log.info("종료 중 SSH 연결 정리: {}@{}", session.getUserName(), session.getHost());
                }
            } catch (Exception e) {
                log.warn("세션 종료 중 오류 발생: {}", e.getMessage());
            }
        }
        activeSessions.clear();
    }
}