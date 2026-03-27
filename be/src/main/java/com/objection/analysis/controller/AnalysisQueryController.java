package com.objection.analysis.controller;

import com.objection.analysis.dto.response.AnalysisResultResponse;
import com.objection.analysis.dto.response.MatchedPrecedentResponse;
import com.objection.analysis.service.AnalysisService;
import com.objection.analysis.service.PrecedentMatchingService;
import com.objection.common.response.ApiResponse; // 팀 공통 응답 포맷 경로
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisQueryController {

    private final AnalysisService analysisService;
    private final PrecedentMatchingService precedentMatchingService;

    @GetMapping("/{analysisNo}/precedents")
    public ResponseEntity<ApiResponse<MatchedPrecedentResponse>> getMatchedPrecedent(
            @PathVariable("analysisNo") Integer analysisNo) {

        MatchedPrecedentResponse response = precedentMatchingService.getMatchedPrecedentInfo(analysisNo);

        return ResponseEntity.ok(ApiResponse.success("유사 판례 조회 성공", response));
    }

    // AI 판례 분석 결과 조회
    @GetMapping("/{analysisNo}")
    public ResponseEntity<ApiResponse<AnalysisResultResponse>> getAnalysisResult(
            @PathVariable("analysisNo") Integer analysisNo) {

        AnalysisResultResponse response = analysisService.getPrecedentResult(analysisNo);

        return ResponseEntity.ok(ApiResponse.success("분석 결과 조회 성공", response));
    }
}