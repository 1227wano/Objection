package com.objection.analysis.service;

import com.objection.analysis.dto.request.AnalysisRequest;
import com.objection.analysis.dto.response.AnalysisStartResponse;
import com.objection.analysis.entity.CaseAnalysis;
import com.objection.analysis.repository.CaseAnalysisRepository;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final CaseRepository caseRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final CaseAnalysisRepository caseAnalysisRepository;
    private final AnalysisPipelineService analysisPipelineService;

    @Transactional
    public AnalysisStartResponse startAnalysis(Integer caseNo, Integer userNo,
                                               AnalysisRequest request) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        Optional<GovDocument> docOpt = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE");
        GovDocument doc = docOpt.orElse(null);

        Integer govDocNo = request.getGovDocNo() != null
                ? request.getGovDocNo()
                : (doc != null ? doc.getGovDocNo() : null);

        CaseAnalysis analysis = CaseAnalysis.builder()
                .govDocNo(govDocNo)
                .build();
        caseAnalysisRepository.save(analysis);

        found.updateStatus(CaseStatus.STRATEGY_GENERATING);

        // 별도 빈으로 분리된 서비스 호출 → 프록시 타서 진짜 비동기로 동작
        analysisPipelineService.runPipeline(found, analysis, doc, request.getCaseStage());

        return new AnalysisStartResponse(
                analysis.getAnalysisNo(),
                request.getCaseStage(),
                "PROCESSING",
                30
        );
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