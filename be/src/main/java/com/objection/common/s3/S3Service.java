package com.objection.common.s3;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    // URL 생성을 위해 region 정보 가져오기
    @Value("${cloud.aws.region.static}")
    private String region;

    // S3에 파일 업로드
    public String uploadFile(MultipartFile file, Integer caseNo) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String fileKey = "cases/" + caseNo + "/" + uniqueFileName;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("S3 파일 업로드 성공. Key: {}", fileKey);
            return fileKey;

        } catch (IOException e) {
            log.error("S3 파일 업로드 실패", e);
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
        }
    }

    // fileKey를 바탕으로 외부에서 접근 가능한 Public URL 생성
    public String getFileUrl(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) return null;
        // AWS S3 기본 URL 포맷: https://[버킷명].s3.[리전].amazonaws.com/[파일키]
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileKey);
    }

    /**
     * AI 오류 등 발생 시 S3에 올라간 파일 롤백(삭제)
     */
    public void deleteFile(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) return;

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("S3 파일 삭제(롤백) 성공. Key: {}", fileKey);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", fileKey, e);
        }
    }
}