package com.objection.narrative.service;

import com.objection.cases.entity.Case;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import com.objection.narrative.dto.request.NarrativeRequest;
import com.objection.narrative.dto.response.NarrativeResponse;
import com.objection.narrative.dto.response.NarrativeSaveResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NarrativeService {

    private final CaseRepository caseRepository;
    private final GovDocumentRepository govDocumentRepository;

    @Transactional
    public NarrativeSaveResponse saveNarrative(Integer caseNo, Integer userNo, NarrativeRequest request) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        GovDocument doc = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE")
                .orElseThrow(() -> new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND));

        doc.updateNarrative(request.getFact(), request.getOpinion());

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