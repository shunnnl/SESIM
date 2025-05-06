package com.backend.sesim.domain.terraform.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.Enumeration;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 s3Client;

    /**
     * S3에서 파일을 다운로드합니다.
     *
     * @param bucketName S3 버킷 이름
     * @param key 파일 키
     * @return 다운로드된 임시 파일
     * @throws IOException 파일 다운로드 중 오류 발생 시
     */
    public File downloadFile(String bucketName, String key) throws IOException {
        log.info("S3 파일 다운로드 시작: s3://{}/{}", bucketName, key);

        // 고유한 임시 파일 이름 생성 (충돌 방지)
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String extension = key.endsWith(".zip") ? ".zip" : "";

        // 임시 디렉토리 경로 생성
        String tempDir = System.getProperty("java.io.tmpdir");
        Path customDir = Paths.get(tempDir, "s3downloads");
        if (!Files.exists(customDir)) {
            Files.createDirectories(customDir);
        }

        // 안정적인 위치에 파일 저장 (deleteOnExit 사용하지 않음)
        File downloadFile = new File(customDir.toFile(), "s3download-" + uniqueId + extension);

        try {
            S3Object s3Object = s3Client.getObject(bucketName, key);
            try (InputStream inputStream = s3Object.getObjectContent()) {
                Files.copy(
                        inputStream,
                        downloadFile.toPath(),
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            // 파일 다운로드 검증
            log.info("S3 파일 다운로드 완료: {}", downloadFile.getAbsolutePath());
            log.info("파일 존재 여부: {}", downloadFile.exists());
            log.info("파일 크기: {} bytes", downloadFile.length());

            // ZIP 파일인 경우 내용 확인
            if (extension.equals(".zip")) {
                try (ZipFile zipFile = new ZipFile(downloadFile)) {
                    log.info("ZIP 파일 항목 확인:");
                    int entryCount = 0;
                    Enumeration<? extends ZipEntry> entries = zipFile.entries();
                    while (entries.hasMoreElements()) {
                        ZipEntry entry = entries.nextElement();
                        log.info("  - {}", entry.getName());
                        entryCount++;
                    }
                    log.info("총 {}개의 항목이 ZIP 파일에 포함되어 있습니다.", entryCount);
                } catch (IOException e) {
                    log.warn("ZIP 파일 내용 확인 중 오류 발생: {}", e.getMessage());
                }
            }

            return downloadFile;
        } catch (Exception e) {
            // 오류 발생 시 임시 파일 정리
            if (downloadFile.exists()) {
                downloadFile.delete();
            }
            log.error("S3 파일 다운로드 오류: {}", e.getMessage(), e);
            throw new IOException("S3 파일 다운로드 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 다운로드한 임시 파일을 정리합니다.
     *
     * @param file 정리할 파일
     */
    public void cleanupFile(File file) {
        if (file != null && file.exists()) {
            boolean deleted = file.delete();
            if (deleted) {
                log.info("임시 파일 삭제 완료: {}", file.getAbsolutePath());
            } else {
                log.warn("임시 파일 삭제 실패: {}", file.getAbsolutePath());
            }
        }
    }
}