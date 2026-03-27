package com.objection.govdocument.controller;

import com.objection.common.response.ApiResponse;
import com.objection.govdocument.dto.request.DocumentUploadRequest;
import com.objection.govdocument.dto.response.DocumentDetailResponse;
import com.objection.govdocument.dto.response.DocumentUploadResponse;
import com.objection.govdocument.service.GovDocumentService;
import com.objection.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cases/{caseNo}/gov-documents")
@RequiredArgsConstructor
public class GovDocumentController {

    private final GovDocumentService govDocumentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @PathVariable Integer caseNo,
            @ModelAttribute DocumentUploadRequest request) {

        DocumentUploadResponse response = govDocumentService.processDocument(caseNo, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{govDocNo}")
    public ResponseEntity<DocumentDetailResponse> getDocumentDetail(
            @PathVariable Integer caseNo,
            @PathVariable Integer govDocNo) {

        DocumentDetailResponse response = govDocumentService.getDocumentDetail(caseNo, govDocNo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/none")
    public ResponseEntity<ApiResponse<Integer>> createNoneDocument(
            @PathVariable Integer caseNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer govDocNo = govDocumentService.createNoneDocument(caseNo);
        return ResponseEntity.ok(ApiResponse.success("처분서 없음으로 진행합니다.", govDocNo));
    }
}