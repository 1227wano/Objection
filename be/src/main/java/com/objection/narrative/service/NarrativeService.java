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
import com.objection.narrative.dto.request.NarrativeRequest;
import com.objection.narrative.dto.response.NarrativeResponse;
import com.objection.narrative.dto.response.NarrativeSaveResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

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

        GovDocument doc = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE")
                .orElseThrow(() -> new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND));

        // 1. 경위 저장
        doc.updateNarrative(request.getFact(), request.getOpinion());

        // 2. STRATEGY_GENERATING 전이
        found.updateStatus(CaseStatus.STRATEGY_GENERATING);

        // 3. A-1 호출
        try {
            Map<String, Object> parsedFields = doc.getParsedJson() != null
                    ? objectMapper.readValue(doc.getParsedJson(), new TypeReference<>() {})
                    : null;

            AiLegalIssueRequest aiRequest = new AiLegalIssueRequest(
                    caseNo,
                    doc.getGovDocNo(),
                    "NOTICE",
                    new AiLegalIssueRequest.CaseInfo(
                            found.getSanctionType(),
                            found.getSanctionDays() != null ? found.getSanctionDays().intValue() : null,
                            doc.getExtractedText(),
                            parsedFields
                    ),
                    new AiLegalIssueRequest.CaseContext(
                            request.getFact(),
                            request.getOpinion()
                    )
            );

            AiLegalIssueResponse aiResponse = aiAnalysisClient.analyzeLegalIssue(aiRequest);

            if ("SUCCESS".equals(aiResponse.getStatus())) {
                // 4. 성공 → STRATEGY_DONE
                found.updateStatus(CaseStatus.STRATEGY_DONE);
            } else {
                found.updateStatus(CaseStatus.STRATEGY_FAILED);
            }

        } catch (Exception e) {
            log.error("A-1 법적 쟁점 분석 호출 실패 caseNo: {}", caseNo, e);
            // 5. 실패 → STRATEGY_FAILED
            found.updateStatus(CaseStatus.STRATEGY_FAILED);
        }

        return new NarrativeSaveResponse(caseNo, LocalDateTime.now());
    }

    public NarrativeResponse getNarrative(Integer caseNo, Integer userNo) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        GovDocument doc = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE")
                .orElseThrow(() -> new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND));

        return new NarrativeResponse(caseNo, doc.getFact(), doc.getOpinion());
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