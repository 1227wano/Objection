package com.objection.analysis.controller;

import com.objection.analysis.dto.response.MatchedPrecedentResponse;
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

    private final PrecedentMatchingService precedentMatchingService;

    @GetMapping("/{analysisNo}/precedents")
    public ResponseEntity<ApiResponse<MatchedPrecedentResponse>> getMatchedPrecedent(
            @PathVariable("analysisNo") Integer analysisNo) {

        // 서비스 로직 호출
        MatchedPrecedentResponse response = precedentMatchingService.getMatchedPrecedentInfo(analysisNo);

        // 성공 응답 반환 (팀 컨벤션에 맞게 메시지는 적절히 수정하세요)
        return ResponseEntity.ok(ApiResponse.success("유사 판례 조회 성공", response));
    }
}