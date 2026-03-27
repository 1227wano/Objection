package com.objection.analysis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.objection.narrative.client.AiAnalysisClient;
import com.objection.narrative.dto.ai.AiLegalIssueRequest;
import com.objection.narrative.dto.ai.AiLegalIssueResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final CaseRepository caseRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final CaseAnalysisRepository caseAnalysisRepository;
    private final AiAnalysisClient aiAnalysisClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalysisStartResponse startAnalysis(Integer caseNo, Integer userNo,
                                               AnalysisRequest request) {
        Case found = getCaseOrThrow(caseNo);
        validateOwner(found, userNo);

        // 처분서 조회 (없어도 진행 가능)
        Optional<GovDocument> docOpt = govDocumentRepository
                .findByCaseNoAndDocumentType(caseNo, "NOTICE");
        GovDocument doc = docOpt.orElse(null);

        Integer govDocNo = request.getGovDocNo() != null
                ? request.getGovDocNo()
                : (doc != null ? doc.getGovDocNo() : null);

        // case_analysis INSERT
        CaseAnalysis analysis = CaseAnalysis.builder()
                .govDocNo(govDocNo)
                .build();
        caseAnalysisRepository.save(analysis);

        found.updateStatus(CaseStatus.STRATEGY_GENERATING);

        // 비동기 A-1 호출
        runStep1_LegalIssueAnalysis(found, analysis, doc, request.getCaseStage());

        return new AnalysisStartResponse(
                analysis.getAnalysisNo(),
                request.getCaseStage(),
                "PROCESSING",
                30
        );
    }

    @Async("analysisExecutor")
    @Transactional
    public void runStep1_LegalIssueAnalysis(Case found, CaseAnalysis analysis,
                                            GovDocument doc, String caseStage) {
        try {
            String extractedText = doc != null ? doc.getExtractedText() : null;
            String parsedJsonStr  = doc != null ? doc.getParsedJson()   : null;
            String fact           = doc != null ? doc.getFact()         : null;
            String opinion        = doc != null ? doc.getOpinion()      : null;

            Map<String, Object> parsedFields = null;
            if (parsedJsonStr != null) {
                parsedFields = objectMapper.readValue(parsedJsonStr, new TypeReference<>() {});
            }

            String disposalDate = found.getDisposalDate() != null
                    ? found.getDisposalDate().toString()
                    : null;

            AiLegalIssueRequest a1Request = new AiLegalIssueRequest(
                    found.getCaseNo(),
                    doc != null ? doc.getGovDocNo() : null,
                    "NOTICE",
                    new AiLegalIssueRequest.CaseInfo(
                            disposalDate,
                            found.getAgencyName(),
                            found.getSanctionType(),
                            found.getSanctionDays() != null ? found.getSanctionDays().intValue() : null,
                            parsedFields,
                            extractedText
                    ),
                    new AiLegalIssueRequest.CaseContext(fact, opinion),
                    Collections.emptyList(), // TODO: Step 3 완료 후 lawRetrievals 채울 예정
                    null                     // appealClaimContent: NOTICE 단계라 null
            );

            AiLegalIssueResponse a1Response = aiAnalysisClient.analyzeLegalIssue(a1Request);
            log.info("A-1 응답 수신 caseNo={}, status={}", found.getCaseNo(), a1Response.getStatus());

            if (!"SUCCESS".equals(a1Response.getStatus())) {
                markFailed(found);
                return;
            }

            // law_result 저장
            String lawResultJson = objectMapper.writeValueAsString(a1Response.getResult());
            analysis.updateLawResult(lawResultJson);
            caseAnalysisRepository.save(analysis);

            log.info("Step 2 완료 - law_result 저장 analysisNo={}", analysis.getAnalysisNo());

            // TODO: Step 3 팀원 작업 완료 후 연동
            // TODO: Step 4, 5, 6 - A-2 호출

        } catch (Exception e) {
            log.error("A-1 파이프라인 실패 analysisNo={}", analysis.getAnalysisNo(), e);
            markFailed(found);
        }
    }

    private void markFailed(Case found) {
        found.updateStatus(CaseStatus.STRATEGY_FAILED);
        caseRepository.save(found);
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