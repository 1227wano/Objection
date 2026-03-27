    package com.objection.analysis.service;

    import com.fasterxml.jackson.core.type.TypeReference;
    import com.fasterxml.jackson.databind.ObjectMapper;
    import com.objection.analysis.dto.request.AnalysisRequest;
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
    import com.objection.narrative.dto.ai.AiStrategyRequest;
    import com.objection.narrative.dto.ai.AiStrategyResponse;
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
                        Collections.emptyList(),
                        null
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

                // Step 4: A-2 호출
                AiStrategyRequest a2Request = new AiStrategyRequest(
                        found.getCaseNo(),
                        doc != null ? doc.getGovDocNo() : null,
                        "NOTICE",
                        new AiStrategyRequest.CaseInfo(
                                disposalDate,
                                found.getAgencyName(),
                                found.getSanctionType(),
                                found.getSanctionDays() != null ? found.getSanctionDays().intValue() : null,
                                parsedFields,
                                extractedText
                        ),
                        new AiStrategyRequest.CaseContext(fact, opinion),
                        new AiStrategyRequest.LegalIssueAnalysisResult(
                                a1Response.getResult().getLegalIssueSummary(),
                                a1Response.getResult().getLegalWeaknessFound(),
                                a1Response.getResult().getLegalIssues()
                        ),
                        Collections.singletonList(new AiStrategyRequest.PrecedentRetrieval(
                                matchedPrecedent.getPrecedentNo(),
                                matchedPrecedent.getPrecedentName(),
                                null,
                                matchedPrecedent.getSimilarityScore().floatValue()
                        )),
                        null  // NOTICE 단계라 null
                );

                AiStrategyResponse a2Response = aiAnalysisClient.analyzeStrategy(a2Request);
                log.info("A-2 응답 수신 caseNo={}, status={}", found.getCaseNo(), a2Response.getStatus());

                if (!"SUCCESS".equals(a2Response.getStatus())) {
                    markFailed(found);
                    return;
                }

                // precedent_result 저장
                String precedentResultJson = objectMapper.writeValueAsString(a2Response.getResult());
                analysis.updatePrecedentResult(precedentResultJson);
                caseAnalysisRepository.save(analysis);

                log.info("Step 4 완료 - precedent_result 저장 analysisNo={}", analysis.getAnalysisNo());

                // Step 5: match_reason 업데이트
                String matchReason = null;
                if (a2Response.getResult().getPrecedentInfos() != null
                        && !a2Response.getResult().getPrecedentInfos().isEmpty()) {
                    matchReason = a2Response.getResult().getPrecedentInfos().get(0).getMatchReason();
                }
                precedentMatchingService.updateMatchReason(analysis.getAnalysisNo(), matchReason);

                log.info("Step 5 완료 - match_reason 저장 analysisNo={}", analysis.getAnalysisNo());

                // Step 6: 상태 업데이트
                found.updateStatus(CaseStatus.STRATEGY_DONE);
                caseRepository.save(found);

                log.info("Step 6 완료 - 분석 파이프라인 종료 caseNo={}", found.getCaseNo());

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