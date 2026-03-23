package com.objection.narrative.controller;

import com.objection.common.response.ApiResponse;
import com.objection.narrative.dto.request.NarrativeRequest;
import com.objection.narrative.dto.response.NarrativeResponse;
import com.objection.narrative.dto.response.NarrativeSaveResponse;
import com.objection.narrative.service.NarrativeService;
import com.objection.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cases/{caseNo}/narrative")
@RequiredArgsConstructor
public class NarrativeController {

    private final NarrativeService narrativeService;

    // 사건 경위 저장
    @PostMapping
    public ResponseEntity<ApiResponse<NarrativeSaveResponse>> saveNarrative(
            @PathVariable Integer caseNo,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody NarrativeRequest request) {

        NarrativeSaveResponse response = narrativeService.saveNarrative(
                caseNo, userDetails.getUserNo(), request);

        return ResponseEntity
                .ok(ApiResponse.success("사건 경위가 저장되었습니다.", response));
    }

    // 사건 경위 조회
    @GetMapping
    public ResponseEntity<ApiResponse<NarrativeResponse>> getNarrative(
            @PathVariable Integer caseNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        NarrativeResponse response = narrativeService.getNarrative(
                caseNo, userDetails.getUserNo());

        return ResponseEntity
                .ok(ApiResponse.success("요청이 성공했습니다.", response));
    }
}
