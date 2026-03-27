package com.objection.narrative.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import com.objection.narrative.client.AiAnalysisClient;
import com.objection.narrative.dto.request.NarrativeRequest;
import com.objection.narrative.dto.response.NarrativeResponse;
import com.objection.narrative.dto.response.NarrativeSaveResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

        Optional<GovDocument> docOpt = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE");

        // 처분서 있으면 경위 저장
        docOpt.ifPresent(doc -> doc.updateNarrative(request.getFact(), request.getOpinion()));

        // 상태 전이
        found.updateStatus(CaseStatus.NARRATIVE_WRITING);  // ← STRATEGY_GENERATING 대신 이걸로

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