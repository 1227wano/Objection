package com.objection.gendocument.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.analysis.entity.CaseAnalysis;
import com.objection.analysis.repository.CaseAnalysisRepository;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.gendocument.client.AiDocumentDraftClient;
import com.objection.gendocument.dto.ai.AiDocumentDraftRequest;
import com.objection.gendocument.dto.ai.AiDocumentDraftResponse;
import com.objection.gendocument.dto.ai.AiDocumentReviewRequest;
import com.objection.gendocument.dto.ai.AiDocumentReviewResponse;
import com.objection.gendocument.dto.request.DocumentCreateRequest;
import com.objection.gendocument.dto.response.DocumentResponse;
import com.objection.gendocument.entity.GenDocument;
import com.objection.gendocument.repository.GenDocumentRepository;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GenDocumentService {

    private final GenDocumentRepository genDocumentRepository;
    private final CaseAnalysisRepository caseAnalysisRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final CaseRepository caseRepository;
    private final AiDocumentDraftClient aiDocumentDraftClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public DocumentResponse createDocument(Integer analysisNo, Integer userNo, DocumentCreateRequest request) {
        validateDocumentType(request.getDocumentType());

        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        CaseAnalysis analysis = caseAnalysisRepository.findById(analysisNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.ANALYSIS_NOT_FOUND));

        GovDocument govDoc = govDocumentRepository.findById(analysis.getGovDocNo())
                .orElse(null);

        String parsedJsonStr = govDoc != null ? govDoc.getParsedJson() : null;
        String extractedText = govDoc != null ? govDoc.getExtractedText() : null;

        Map<String, Object> parsedFields = null;
        if (parsedJsonStr != null) {
            try {
                parsedFields = objectMapper.readValue(parsedJsonStr, new TypeReference<>() {});
            } catch (Exception ignored) {}
        }

        String sanctionValue = foundCase.getSanctionDays() != null
                ? foundCase.getSanctionDays().toString()
                : null;

        // law_result, precedent_result 파싱
        Map<String, Object> lawResult = null;
        Map<String, Object> precedentResult = null;
        try {
            if (analysis.getLawResult() != null) {
                lawResult = objectMapper.readValue(analysis.getLawResult(), new TypeReference<>() {});
            }
            if (analysis.getPrecedentResult() != null) {
                precedentResult = objectMapper.readValue(analysis.getPrecedentResult(), new TypeReference<>() {});
            }
        } catch (Exception ignored) {}

        // A-3 호출
        AiDocumentDraftRequest draftRequest = new AiDocumentDraftRequest(
                analysisNo,
                request.getDocumentType(),
                new AiDocumentDraftRequest.CaseInfo(
                        foundCase.getDisposalDate() != null ? foundCase.getDisposalDate().toString() : null,
                        foundCase.getAgencyName(),
                        foundCase.getSanctionType(),
                        sanctionValue,
                        parsedFields,
                        extractedText
                ),
                lawResult != null ? objectMapper.convertValue(lawResult, AiDocumentDraftRequest.LegalIssueAnalysisResult.class) : null,
                precedentResult != null ? objectMapper.convertValue(precedentResult, AiDocumentDraftRequest.StrategyPrecedentAnalysisResult.class) : null,
                Collections.emptyList()
        );

        AiDocumentDraftResponse draftResponse = aiDocumentDraftClient.draftDocument(draftRequest);
        log.info("A-3 응답 수신 analysisNo={}, status={}", analysisNo, draftResponse.getStatus());

        if (!"SUCCESS".equals(draftResponse.getStatus()) || draftResponse.getResult() == null) {
            throw new BusinessException(ErrorCode.DOCUMENT_GENERATION_FAILED);
        }

        Map<String, Object> draftContentJson = draftResponse.getResult().getContentJson();

        // B 호출
        AiDocumentReviewRequest reviewRequest = new AiDocumentReviewRequest(
                analysisNo,
                request.getDocumentType(),
                new AiDocumentReviewRequest.DraftDocument(draftContentJson),
                new AiDocumentReviewRequest.CaseInfo(
                        foundCase.getAgencyName(),
                        foundCase.getSanctionType(),
                        sanctionValue,
                        parsedFields,
                        extractedText
                ),
                lawResult != null ? objectMapper.convertValue(lawResult, AiDocumentReviewRequest.LegalIssueAnalysisResult.class) : null,
                precedentResult != null ? objectMapper.convertValue(precedentResult, AiDocumentReviewRequest.StrategyPrecedentAnalysisResult.class) : null,
                Collections.emptyList()
        );

        AiDocumentReviewResponse reviewResponse = aiDocumentDraftClient.reviewDocument(reviewRequest);
        log.info("B 응답 수신 analysisNo={}, status={}", analysisNo, reviewResponse.getStatus());

        Map<String, Object> finalContentJson = draftContentJson;
        if ("SUCCESS".equals(reviewResponse.getStatus()) && reviewResponse.getResult() != null
                && reviewResponse.getResult().getContentJson() != null) {
            finalContentJson = reviewResponse.getResult().getContentJson();
        }

        // APPEAL_CLAIM이면 parsedJson에서 Inform, InformContent 추가
        if ("APPEAL_CLAIM".equals(request.getDocumentType()) && parsedFields != null) {
            Object inform = parsedFields.get("Inform");
            Object informContent = parsedFields.get("InformContent");
            if (inform != null) finalContentJson.put("grievanceNotified", inform);
            if (informContent != null) finalContentJson.put("grievanceContent", informContent);
        }

        String contentJsonStr;
        try {
            contentJsonStr = objectMapper.writeValueAsString(finalContentJson);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.DOCUMENT_GENERATION_FAILED);
        }

        GenDocument doc = GenDocument.builder()
                .analysisNo(analysisNo)
                .documentType(request.getDocumentType())
                .contentJson(contentJsonStr)
                .build();

        GenDocument saved = genDocumentRepository.save(doc);
        foundCase.updateStatus(CaseStatus.DOC_GENERATED);

        return toResponse(saved);
    }

    public DocumentResponse getDocument(Integer analysisNo, Integer userNo) {
        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        GenDocument doc = genDocumentRepository.findById(analysisNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));

        return toResponse(doc);
    }

    @Transactional
    public DocumentResponse patchDocument(Integer analysisNo, Integer userNo, Map<String, Object> contentJsonPatch) {
        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        GenDocument doc = genDocumentRepository.findById(analysisNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));

        String mergedJson = mergeContentJson(doc.getContentJson(), contentJsonPatch);
        doc.updateContentJson(mergedJson);

        return toResponse(doc);
    }

    private void validateDocumentType(String documentType) {
        if (!"APPEAL_CLAIM".equals(documentType) && !"SUPPLEMENT_STATEMENT".equals(documentType)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
    }

    private Case getCaseByAnalysisNoOrThrow(Integer analysisNo) {
        CaseAnalysis analysis = caseAnalysisRepository.findById(analysisNo)
                .orElseThrow(() -> new BusinessException(ErrorCode.ANALYSIS_NOT_FOUND));

        GovDocument govDoc = govDocumentRepository.findById(analysis.getGovDocNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND));

        return caseRepository.findById(govDoc.getCaseNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND));
    }

    private void validateOwner(Case foundCase, Integer userNo) {
        if (!foundCase.getUserNo().equals(userNo)) {
            throw new BusinessException(ErrorCode.DOCUMENT_ACCESS_DENIED);
        }
    }

    private String mergeContentJson(String existingJson, Map<String, Object> patch) {
        try {
            Map<String, Object> existing = objectMapper.readValue(existingJson,
                    objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
            existing.putAll(patch);
            return objectMapper.writeValueAsString(existing);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
    }

    private DocumentResponse toResponse(GenDocument doc) {
        Object parsedContent;
        try {
            parsedContent = objectMapper.readValue(doc.getContentJson(), Object.class);
        } catch (JsonProcessingException e) {
            parsedContent = doc.getContentJson();
        }

        return DocumentResponse.builder()
                .analysisNo(doc.getAnalysisNo())
                .documentType(doc.getDocumentType())
                .contentJson(parsedContent)
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }
}