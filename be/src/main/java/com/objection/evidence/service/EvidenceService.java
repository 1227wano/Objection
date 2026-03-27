package com.objection.evidence.service;


import com.objection.analysis.entity.CaseAnalysis;
import com.objection.analysis.repository.CaseAnalysisRepository;
import com.objection.cases.entity.Case;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.evidence.dto.request.EvidenceUpdateRequest;
import com.objection.evidence.dto.response.EvidenceResponse;
import com.objection.evidence.entity.EvidenceDocument;
import com.objection.evidence.repository.EvidenceDocumentRepository;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceService {

    private final EvidenceDocumentRepository evidenceDocumentRepository;
    private final CaseAnalysisRepository caseAnalysisRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final CaseRepository caseRepository;

    // 증거 목록 조회
    @Transactional(readOnly = true)
    public List<EvidenceResponse> getEvidenceList(Integer analysisNo, Integer userNo){

        validateOwner(analysisNo, userNo);

        return evidenceDocumentRepository.findAllByAnalysisNoOrderByEvidenceIdAsc(analysisNo)
                .stream()
                .map(EvidenceResponse::from)
                .collect(Collectors.toList());
    }

    // 증거 제출 여부 업데이트
    @Transactional
    public EvidenceResponse updateEvidence(Integer analysisNo, Integer evidenceId, EvidenceUpdateRequest request, Integer userNo){

        validateOwner(analysisNo, userNo);

        EvidenceDocument evidence = evidenceDocumentRepository
                .findByEvidenceIdAndAnalysisNo(evidenceId, analysisNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.EVIDENCE_NOT_FOUND));

        evidence.updateSubmitted(request.getSubmitted());

        return EvidenceResponse.from(evidence);
    }

    // 소유권 검증 : analysisNo → govDocNo → caseNo → userNo
    private void validateOwner(Integer analysisNo, Integer userNo) {

        CaseAnalysis analysis = caseAnalysisRepository.findById(analysisNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.ANALYSIS_NOT_FOUND));

        // govDocNo null 방어 처리
        if (analysis.getGovDocNo() == null) {
            throw new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND);
        }

        GovDocument govDoc = govDocumentRepository.findById(analysis.getGovDocNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND));

        Case foundCase = caseRepository.findById(govDoc.getCaseNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND));

        if(!foundCase.getUserNo().equals(userNo)){
            throw new BusinessException(ErrorCode.CASE_ACCESS_DENIED);
        }
    }

}
