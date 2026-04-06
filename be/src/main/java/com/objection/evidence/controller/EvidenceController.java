package com.objection.evidence.controller;

import com.objection.common.response.ApiResponse;
import com.objection.evidence.dto.request.EvidenceUpdateRequest;
import com.objection.evidence.dto.response.EvidenceResponse;
import com.objection.evidence.service.EvidenceService;
import com.objection.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis/{analysisNo}/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    // 증거 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<EvidenceResponse>>> getEvidenceList(
            @PathVariable Integer analysisNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<EvidenceResponse> response = evidenceService.getEvidenceList(
                analysisNo, userDetails.getUserNo());

        return ResponseEntity
                .ok(ApiResponse.success("요청이 성공했습니다.", response));
    }

    // 증거 제출 여부 업데이트
    @PatchMapping("/{evidenceId}")
    public ResponseEntity<ApiResponse<EvidenceResponse>> updateEvidence(
            @PathVariable Integer analysisNo,
            @PathVariable Integer evidenceId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody EvidenceUpdateRequest request) {

        EvidenceResponse response = evidenceService.updateEvidence(
                analysisNo, evidenceId, request, userDetails.getUserNo());

        return ResponseEntity
                .ok(ApiResponse.success("증거 서류 준비 여부가 업데이트되었습니다.", response));
    }

}
