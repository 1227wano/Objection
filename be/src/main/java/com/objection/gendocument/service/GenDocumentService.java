package com.objection.gendocument.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.analysis.entity.CaseAnalysis;
import com.objection.analysis.repository.CaseAnalysisRepository;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.exception.BusinessException;
import com.objection.common.exception.ErrorCode;
import com.objection.gendocument.dto.request.DocumentCreateRequest;
import com.objection.gendocument.dto.response.DocumentResponse;
import com.objection.gendocument.entity.GenDocument;
import com.objection.gendocument.repository.GenDocumentRepository;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GenDocumentService {

    private final GenDocumentRepository genDocumentRepository;
    private final CaseAnalysisRepository caseAnalysisRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final CaseRepository caseRepository;
    private final ObjectMapper objectMapper;

    // 문서 생성
    @Transactional
    public DocumentResponse createDocument(Integer analysisNo, Integer userNo, DocumentCreateRequest request) {

        validateDocumentType(request.getDocumentType());

        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        String contentJson = buildEmptyContentJson(request.getDocumentType());

        GenDocument doc = GenDocument.builder()
                .analysisNo(analysisNo)
                .documentType(request.getDocumentType())
                .contentJson(contentJson)
                .build();

        GenDocument saved = genDocumentRepository.save(doc);
        foundCase.updateStatus(CaseStatus.DOC_GENERATED);

        return toResponse(saved);
    }

    // 생성 문서 조회
    public DocumentResponse getDocument(Integer analysisNo, Integer userNo, String documentType) {
        validateDocumentType(documentType);

        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        GenDocument doc = genDocumentRepository
                .findByAnalysisNoAndDocumentType(analysisNo, documentType)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));

        return toResponse(doc);
    }

    // 문서 수정 (PATCH)
    @Transactional
    public DocumentResponse patchDocument(Integer analysisNo, Integer userNo, String documentType, Map<String, Object> contentJsonPath) {

        validateDocumentType(documentType);

        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        GenDocument doc = genDocumentRepository
                .findByAnalysisNoAndDocumentType(analysisNo, documentType)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));

        String mergeJson = mergeContentJson(doc.getContentJson(), contentJsonPath);
        doc.updateContentJson(mergeJson);

        return toResponse(doc);

    }

    // PDF 다운로드용 contentJson 조회
    public String getContentJsonForPdf(Integer analysisNo, Integer userNo, String documentType) {
        validateDocumentType(documentType);

        Case foundCase = getCaseByAnalysisNoOrThrow(analysisNo);
        validateOwner(foundCase, userNo);

        GenDocument doc = genDocumentRepository
                .findByAnalysisNoAndDocumentType(analysisNo, documentType)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND));

        return doc.getContentJson();
    }

    private void validateDocumentType(String documentType) {
        if(!"APPEAL_CLAIM".equals(documentType) && !"SUPPLEMENT_STATEMENT".equals(documentType)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
    }

    private Case getCaseByAnalysisNoOrThrow(Integer analysisNo) {

        CaseAnalysis analysis = caseAnalysisRepository.findById(analysisNo).
                orElseThrow(() -> new BusinessException(ErrorCode.ANALYSIS_NOT_FOUND));

        GovDocument govDoc = govDocumentRepository.findById(analysis.getGovDocNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.GOV_DOC_NOT_FOUND));

        return caseRepository.findById(govDoc.getCaseNo())
                .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND));
    }

    private void validateOwner(Case foundCase, Integer userNo) {
        if(!foundCase.getUserNo().equals(userNo)) {
            throw new BusinessException(ErrorCode.DOCUMENT_ACCESS_DENIED);
        }
    }

    private String buildEmptyContentJson(String documentType) {
        try{
            if("APPEAL_CLAIM".equals(documentType)) {
                return objectMapper.writeValueAsString(Map.of(
                        "committeeType", "",
                        "dispositionContent", "",
                        "claimPurpose", "",
                        "claimReason", ""
                ));
            } else {
                return objectMapper.writeValueAsString(Map.of(
                        "submissionContent", ""
                ));
            }
        } catch (JsonProcessingException e){
            throw new BusinessException(ErrorCode.DOCUMENT_GENERATION_FAILED);
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
