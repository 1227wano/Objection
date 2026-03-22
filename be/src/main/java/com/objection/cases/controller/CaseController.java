package com.objection.cases.controller;

import com.objection.cases.dto.request.CaseTitleUpdateRequest;
import com.objection.cases.dto.response.CaseCreateResponse;
import com.objection.cases.dto.response.CaseListResponse;
import com.objection.cases.dto.response.CaseStatusResponse;
import com.objection.cases.dto.response.CaseTitleUpdateResponse;
import com.objection.cases.service.CaseService;
import com.objection.common.response.ApiResponse;
import com.objection.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    // 사건 생성
    @PostMapping
    public ResponseEntity<ApiResponse<CaseCreateResponse>> createCase(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        CaseCreateResponse response = caseService.createCase(userDetails.getUserNo());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("사건이 생성되었습니다.", response));
    }

    // 사건 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<CaseListResponse>>> getCases(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<CaseListResponse> response = caseService.getCases(userDetails.getUserNo());

        return ResponseEntity
                .ok(ApiResponse.success("요청이 성공했습니다.", response));
    }

    // 상태코드 조회
    @GetMapping("/{caseNo}/status")
    public ResponseEntity<ApiResponse<CaseStatusResponse>> getCaseStatus(
            @PathVariable Integer caseNo,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        CaseStatusResponse response = caseService.getCaseStatus(caseNo, userDetails.getUserNo());

        return ResponseEntity
                .ok(ApiResponse.success("요청이 성공했습니다.", response));
    }

    // 사건 제목 수정
    @PutMapping("/{caseNo}/title")
    public ResponseEntity<ApiResponse<CaseTitleUpdateResponse>> updateTitle(
            @PathVariable Integer caseNo,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CaseTitleUpdateRequest request) {

        CaseTitleUpdateResponse response = caseService.updateTitle(
                caseNo, userDetails.getUserNo(), request);

        return ResponseEntity
                .ok(ApiResponse.success("제목이 수정되었습니다.", response));
    }
}
