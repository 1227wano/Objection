package com.objection.analysis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.analysis.dto.request.AnalysisRequest;
import com.objection.analysis.dto.response.AnalysisResultResponse;
import com.objection.analysis.dto.response.AnalysisStartResponse;
import com.objection.analysis.dto.response.PrecedentMatchResultDto;
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

    private final PrecedentMatchingService precedentMatchingService;

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

            // Step 3: '유사 판례 매칭 및 저장' 로직 호출
            log.info("Step 3 시작 - 유사 판례 매칭 진행 analysisNo={}", analysis.getAnalysisNo());

            // precedentMatchingService 내부에서 DB 저장까지 완벽하게 수행하고 매칭된 결과를 반환합니다.
            PrecedentMatchResultDto matchedPrecedent =
                    precedentMatchingService.matchPrecedent(analysis.getAnalysisNo());

            log.info("Step 3 완료 - 매칭된 판례번호={}", matchedPrecedent.getPrecedentNo());
            // ----------------------------------------------------------------------
            // TODO: Step 4, 5, 6 - A-2(판례/전략 Agent) 호출
            // ----------------------------------------------------------------------
            // 1) A-2 호출 시 matchedPrecedent.getPrecedentNo() 혹은 관련 데이터를 파라미터로 넘겨줍니다.
            //    예: AiStrategyResponse a2Response = aiAnalysisClient.analyzeStrategy(..., matchedPrecedent.getPrecedentNo());
            //
            // 2) A-2 응답을 받으면 analysis 테이블에 판례분석결과 업데이트
            //    analysis.updatePrecedentResult(a2Response.getJsonData());
            //
            // 3) case_precedent_matches 테이블에 매칭 사유(match_reason) 업데이트
            //    precedentMatchingService.updateMatchReason(analysis.getAnalysisNo(), a2Response.getMatchReason());
            //
            // 4) 상태 업데이트 및 마무리 (CaseStatus.COMPLETED 등)

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

    @Transactional(readOnly = true)
    public AnalysisResultResponse getPrecedentResult(Integer analysisNo) {

        // 1. 분석 결과 조회
        CaseAnalysis caseAnalysis = caseAnalysisRepository.findByAnalysisNo(analysisNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 분석 결과를 찾을 수 없습니다. 분석번호: " + analysisNo));

        // 2. DTO 변환 및 반환
        return AnalysisResultResponse.builder()
                .precedentResult(caseAnalysis.getPrecedentResult())
                .build();
    }
}