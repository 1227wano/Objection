package com.objection.analysis.controller;

import com.objection.analysis.dto.request.AnalysisRequest;
import com.objection.analysis.dto.response.AnalysisStartResponse;
import com.objection.analysis.service.AnalysisService;
import com.objection.common.response.ApiResponse;
import com.objection.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cases/{caseNo}")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/analysis")
    public ResponseEntity<ApiResponse<AnalysisStartResponse>> startAnalysis(
            @PathVariable Integer caseNo,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AnalysisRequest request) {

        AnalysisStartResponse response = analysisService.startAnalysis(
                caseNo, userDetails.getUserNo(), request);

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("AI 분석이 시작되었습니다.", response));
    }
}