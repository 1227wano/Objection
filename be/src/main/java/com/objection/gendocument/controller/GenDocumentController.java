package com.objection.gendocument.controller;

import com.objection.common.response.ApiResponse;
import com.objection.gendocument.dto.request.DocumentCreateRequest;
import com.objection.gendocument.dto.response.DocumentResponse;
import com.objection.gendocument.service.GenDocumentService;
import com.objection.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analysis/{analysisNo}/documents")
@RequiredArgsConstructor
public class GenDocumentController {

    private final GenDocumentService genDocumentService;

    // 문서 생성
    @PostMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> createDocument(
            @PathVariable Integer analysisNo,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody DocumentCreateRequest request) {

        DocumentResponse response = genDocumentService.createDocument(
                analysisNo, userDetails.getUserNo(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("문서가 생성되었습니다.", response));
    }

    // 생성 문서 조회
    @GetMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(
            @PathVariable Integer analysisNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        DocumentResponse response = genDocumentService.getDocument(
                analysisNo, userDetails.getUserNo());

        return ResponseEntity
                .ok(ApiResponse.success("요청이 성공했습니다.", response));
    }

    // 문서 수정 (PATCH)
    @PatchMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> patchDocument(
            @PathVariable Integer analysisNo,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        @SuppressWarnings("unchecked")
        Map<String, Object> contentJsonPatch = (Map<String, Object>) body.get("contentJson");

        DocumentResponse response = genDocumentService.patchDocument(
                analysisNo, userDetails.getUserNo(), contentJsonPatch);

        return ResponseEntity
                .ok(ApiResponse.success("문서가 수정되었습니다.", response));
    }

    // 문서 다운로드 (PDF)
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Integer analysisNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        DocumentResponse doc = genDocumentService.getDocument(
                analysisNo, userDetails.getUserNo());

        byte[] pdfBytes = genDocumentService.generatePdf(
                analysisNo, userDetails.getUserNo());

        String filename = "APPEAL_CLAIM".equals(doc.getDocumentType()) ? "행정심판청구서.pdf" : "보충서면.pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(pdfBytes);
    }
}