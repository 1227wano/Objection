package com.objection.analysis.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.analysis.dto.response.PrecedentMatchResultDto;
import com.objection.analysis.entity.CaseAnalysis;
import com.objection.analysis.repository.CaseAnalysisRepository;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.govdocument.entity.GovDocument;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisPipelineService {

    private final CaseRepository caseRepository;
    private final CaseAnalysisRepository caseAnalysisRepository;
    private final AiAnalysisClient aiAnalysisClient;
    private final ObjectMapper objectMapper;
    private final PrecedentMatchingService precedentMatchingService;

    @Async("analysisExecutor")
    @Transactional
    public void runPipeline(Case found, CaseAnalysis analysis,
                            GovDocument doc, String caseStage) {
        try {
            String sourceDocumentType = switch (caseStage) {
                case "APPEAL"   -> "NOTICE";
                case "REPLY"    -> "ANSWER";
                case "DECISION" -> "DECISION";
                default         -> "NOTICE";
            };

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

            String sanctionValue = found.getSanctionDays() != null
                    ? found.getSanctionDays().toString()
                    : null;

            // lawRetrievals 채우기
            List<AiLegalIssueRequest.LawRetrieval> lawRetrievals = new ArrayList<>();
            if (parsedFields != null && parsedFields.get("legalBasis") != null) {
                Object legalBasisObj = parsedFields.get("legalBasis");
                List<String> legalBasisList = new ArrayList<>();

                if (legalBasisObj instanceof List) {
                    for (Object item : (List<?>) legalBasisObj) {
                        legalBasisList.add(item.toString());
                    }
                } else {
                    legalBasisList.add(legalBasisObj.toString());
                }

                for (String legalBasis : legalBasisList) {
                    // "식품위생법 제44조" → ["식품위생법", "제44조"]
                    String[] parts = legalBasis.trim().split(" ");
                    if (parts.length >= 2) {
                        String lawName = parts[0];
                        String articleNo = parts[1];
                        String provisionText = caseAnalysisRepository
                                .findProvisionTextByLawNameAndArticle(lawName, articleNo);
                        if (provisionText != null) {
                            lawRetrievals.add(new AiLegalIssueRequest.LawRetrieval(
                                    lawName, articleNo, provisionText));
                        }
                    }
                }
            }

            log.info("lawRetrievals 구성 완료 size={}", lawRetrievals.size());

            // Step 1: A-1 호출
            AiLegalIssueRequest a1Request = new AiLegalIssueRequest(
                    found.getCaseNo(),
                    doc != null ? doc.getGovDocNo() : null,
                    sourceDocumentType,
                    new AiLegalIssueRequest.CaseInfo(
                            disposalDate,
                            found.getAgencyName(),
                            found.getSanctionType(),
                            sanctionValue,
                            parsedFields,
                            extractedText
                    ),
                    new AiLegalIssueRequest.CaseContext(fact, opinion),
                    lawRetrievals,
                    null
            );

            AiLegalIssueResponse a1Response = aiAnalysisClient.analyzeLegalIssue(a1Request);
            log.info("A-1 응답 수신 caseNo={}, status={}", found.getCaseNo(), a1Response.getStatus());

            if (a1Response.getWarnings() != null && !a1Response.getWarnings().isEmpty()) {
                log.warn("A-1 warnings caseNo={}, warnings={}", found.getCaseNo(), a1Response.getWarnings());
            }

            if (!"SUCCESS".equals(a1Response.getStatus())) {
                markFailed(found);
                return;
            }

            // Step 2: law_result 저장
            String lawResultJson = objectMapper.writeValueAsString(a1Response.getResult());
            analysis.updateLawResult(lawResultJson);
            caseAnalysisRepository.save(analysis);
            log.info("Step 2 완료 - law_result 저장 analysisNo={}", analysis.getAnalysisNo());

            // Step 3: 유사 판례 매칭
            log.info("Step 3 시작 - 유사 판례 매칭 진행 analysisNo={}", analysis.getAnalysisNo());
            PrecedentMatchResultDto matchedPrecedent =
                    precedentMatchingService.matchPrecedent(analysis.getAnalysisNo());
            log.info("Step 3 완료 - 매칭된 판례번호={}", matchedPrecedent.getPrecedentNo());

            // Step 4: A-2 호출
            AiStrategyRequest a2Request = new AiStrategyRequest(
                    found.getCaseNo(),
                    doc != null ? doc.getGovDocNo() : null,
                    sourceDocumentType,
                    new AiStrategyRequest.CaseInfo(
                            disposalDate,
                            found.getAgencyName(),
                            found.getSanctionType(),
                            sanctionValue,
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
                    null
            );

            AiStrategyResponse a2Response = aiAnalysisClient.analyzeStrategy(a2Request);
            log.info("A-2 응답 수신 caseNo={}, status={}", found.getCaseNo(), a2Response.getStatus());

            if (a2Response.getWarnings() != null && !a2Response.getWarnings().isEmpty()) {
                log.warn("A-2 warnings caseNo={}, warnings={}", found.getCaseNo(), a2Response.getWarnings());
            }

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
            log.error("파이프라인 실패 analysisNo={}", analysis.getAnalysisNo(), e);
            found.updateStatus(CaseStatus.STRATEGY_FAILED);
            caseRepository.save(found);
        }
    }

    private void markFailed(Case found) {
        found.updateStatus(CaseStatus.STRATEGY_FAILED);
        caseRepository.save(found);
    }
}