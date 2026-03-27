package com.objection.analysis.controller;

import com.objection.analysis.dto.response.ApiResponse;
import com.objection.analysis.dto.response.PrecedentMatchResultDto;
import com.objection.analysis.service.PrecedentMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class PrecedentMatchController {

    private final PrecedentMatchingService precedentMatchingService;

    @GetMapping("/{analysisNo}/precedents")
    public ResponseEntity<ApiResponse<PrecedentMatchResultDto>> matchPrecedent( // List<> 제거
                                                                                @PathVariable("analysisNo") Integer analysisNo) {

        // 메서드명 matchPrecedent(단수)로 변경, 받는 변수도 List 제거
        PrecedentMatchResultDto result = precedentMatchingService.matchPrecedent(analysisNo);

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}