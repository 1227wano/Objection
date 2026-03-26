package com.objection.narrative.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import com.objection.narrative.client.AiAnalysisClient;
import com.objection.narrative.dto.ai.AiLegalIssueRequest;
import com.objection.narrative.dto.ai.AiLegalIssueResponse;
import com.objection.narrative.dto.ai.AiStrategyRequest;
import com.objection.narrative.dto.ai.AiStrategyResponse;
import com.objection.narrative.dto.request.NarrativeRequest;
import com.objection.narrative.dto.response.NarrativeResponse;
import com.objection.narrative.dto.response.NarrativeSaveResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NarrativeService {

    private final CaseRepository caseRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final AiAnalysisClient aiAnalysisClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public NarrativeSaveResponse saveNarrative(Integer caseNo, Integer userNo, NarrativeRequest request) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        // 처분서 없어도 동작
        Optional<GovDocument> docOpt = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE");

        // 처분서 있으면 경위 저장
        docOpt.ifPresent(doc -> doc.updateNarrative(request.getFact(), request.getOpinion()));

        // doc null 가능
        GovDocument doc = docOpt.orElse(null);
        Integer govDocNo = doc != null ? doc.getGovDocNo() : null;
        String extractedText = doc != null ? doc.getExtractedText() : null;
        String parsedJsonStr = doc != null ? doc.getParsedJson() : null;

        // STRATEGY_GENERATING 전이
        found.updateStatus(CaseStatus.STRATEGY_GENERATING);

        try {
            Map<String, Object> parsedFields = parsedJsonStr != null
                    ? objectMapper.readValue(parsedJsonStr, new TypeReference<>() {})
                    : null;

            AiLegalIssueRequest.CaseInfo caseInfo = new AiLegalIssueRequest.CaseInfo(
                    found.getSanctionType(),
                    found.getSanctionDays() != null ? found.getSanctionDays().intValue() : null,
                    extractedText,
                    parsedFields
            );

            AiLegalIssueRequest.CaseContext caseContext = new AiLegalIssueRequest.CaseContext(
                    request.getFact(),
                    request.getOpinion()
            );

            // A-1 호출
            AiLegalIssueRequest a1Request = new AiLegalIssueRequest(
                    caseNo, govDocNo, "NOTICE", caseInfo, caseContext
            );
            AiLegalIssueResponse a1Response = aiAnalysisClient.analyzeLegalIssue(a1Request);

            if (!"SUCCESS".equals(a1Response.getStatus())) {
                found.updateStatus(CaseStatus.STRATEGY_FAILED);
                return new NarrativeSaveResponse(caseNo, LocalDateTime.now());
            }

            // A-2 호출
            AiStrategyRequest a2Request = new AiStrategyRequest(
                    caseNo,
                    govDocNo,
                    "NOTICE",
                    new AiStrategyRequest.CaseInfo(
                            found.getSanctionType(),
                            found.getSanctionDays() != null ? found.getSanctionDays().intValue() : null,
                            extractedText,
                            parsedFields
                    ),
                    new AiStrategyRequest.CaseContext(
                            request.getFact(),
                            request.getOpinion()
                    ),
                    new AiStrategyRequest.LegalIssueAnalysisResult(
                            a1Response.getResult().getLegalIssueSummary(),
                            a1Response.getResult().getLegalWeaknessFound(),
                            a1Response.getResult().getLegalIssues()
                    )
            );
            AiStrategyResponse a2Response = aiAnalysisClient.analyzeStrategy(a2Request);

            if ("SUCCESS".equals(a2Response.getStatus())) {
                found.updateStatus(CaseStatus.STRATEGY_DONE);
            } else {
                found.updateStatus(CaseStatus.STRATEGY_FAILED);
            }

        } catch (Exception e) {
            log.error("AI 분석 호출 실패 caseNo: {}", caseNo, e);
            found.updateStatus(CaseStatus.STRATEGY_FAILED);
        }

        return new NarrativeSaveResponse(caseNo, LocalDateTime.now());
    }

    public NarrativeResponse getNarrative(Integer caseNo, Integer userNo) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        Optional<GovDocument> docOpt = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE");

        String fact = docOpt.map(GovDocument::getFact).orElse(null);
        String opinion = docOpt.map(GovDocument::getOpinion).orElse(null);

        return new NarrativeResponse(caseNo, fact, opinion);
    }

    private Case getCaseOrThrow(Integer caseNo) {
        return caseRepository.findById(caseNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND));
    }

    private void validateOwner(Case found, Integer userNo) {
        if (!found.getUserNo().equals(userNo)) {
            throw new BusinessException(ErrorCode.CASE_ACCESS_DENIED);
        }
    }
}