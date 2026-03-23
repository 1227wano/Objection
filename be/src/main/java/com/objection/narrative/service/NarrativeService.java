package com.objection.narrative.service;

import com.objection.cases.entity.Case;
import com.objection.cases.repository.CaseRepository;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import com.objection.narrative.dto.request.NarrativeRequest;
import com.objection.narrative.dto.response.NarrativeResponse;
import com.objection.narrative.dto.response.NarrativeSaveResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NarrativeService {

    private final CaseRepository caseRepository;
    private final GovDocumentRepository govDocumentRepository;

    // 사건 경위 저장
    @Transactional
    public NarrativeSaveResponse saveNarrative(Integer caseNo, Integer userNo, NarrativeRequest request) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        GovDocument doc = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE")
                .orElseThrow(() -> new IllegalArgumentException("처분서가 업로드되지 않았습니다."));

        doc.updateNarrative(request.getFact(), request.getOpinion());

        return new NarrativeSaveResponse(caseNo, LocalDateTime.now());
    }

    // 사건 경위 조회
    public NarrativeResponse getNarrative(Integer caseNo, Integer userNo) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        GovDocument doc = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE")
                .orElseThrow(() -> new IllegalArgumentException("처분서가 업로드되지 않았습니다."));

        return new NarrativeResponse(caseNo, doc.getFact(), doc.getOpinion());
    }

    // 본인 사건 확인 (아니면 403 보안상 작성)
    private void validateOwner(Case found, Integer userNo) {
        if(!found.getUserNo().equals(userNo)) {
            throw new AccessDeniedException("본인 사건이 아닙니다.");
        }
    }

    // 사건 조회 (없으면 404)
    private Case getCaseOrThrow(Integer caseNo) {
        return caseRepository.findById(caseNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사건입니다."));
    }
}
