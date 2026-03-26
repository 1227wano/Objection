package com.objection.govdocument.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.cases.entity.Case;
import com.objection.cases.enums.CaseStatus;
import com.objection.cases.repository.CaseRepository;
import com.objection.common.s3.S3Service;
import com.objection.govdocument.client.AiDocumentClient;
import com.objection.govdocument.dto.ai.AiExtractionRequest;
import com.objection.govdocument.dto.ai.AiExtractionResponse;
import com.objection.govdocument.dto.request.DocumentUploadRequest;
import com.objection.govdocument.dto.response.DocumentDetailResponse;
import com.objection.govdocument.dto.response.DocumentUploadResponse;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GovDocumentService {

    private final GovDocumentRepository govDocumentRepository;
    private final CaseRepository caseRepository;
    private final S3Service s3Service;
    private final AiDocumentClient aiDocumentClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public DocumentUploadResponse processDocument(Integer caseNo, DocumentUploadRequest request) {
        String fileKey = null;
        String rawText = null;
        String summary = null;
        String parsedJsonString = null;
        JsonNode parsedFieldsNode = null;

        // 1. 파일 업로드 및 AI 서버 호출 (이제 무조건 FILE 또는 IMAGE만 들어옵니다)
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            fileKey = s3Service.uploadFile(request.getFile(), caseNo);

            try {
                String fileUrl = s3Service.getFileUrl(fileKey);

                // AI 서버 호출
                AiExtractionRequest aiRequest = new AiExtractionRequest(caseNo, request.getDocumentType(), fileUrl);
                AiExtractionResponse aiResponse = aiDocumentClient.extractDocument(aiRequest);

                if ("SUCCESS".equals(aiResponse.getStatus())) {
                    rawText = aiResponse.getResult().getRawText();
                    summary = aiResponse.getResult().getSummary();

                    Map<String, Object> parsedFields = aiResponse.getResult().getParsedFields();
                    parsedJsonString = objectMapper.writeValueAsString(parsedFields);
                    parsedFieldsNode = objectMapper.readTree(parsedJsonString);
                } else {
                    throw new RuntimeException("AI 문서 추출 실패: " + aiResponse.getMessage());
                }
            } catch (Exception e) {
                log.error("AI 처리 중 오류 발생. S3 파일 삭제 진행: {}", fileKey, e);
                s3Service.deleteFile(fileKey);
                throw new RuntimeException("AI 문서 처리 중 오류가 발생했습니다.", e);
            }
        }

        // 2. GovDocument DB Entity 생성 및 저장 (fact, opinion은 null로 기본 저장됨)
        GovDocument document = GovDocument.builder()
                .caseNo(caseNo)
                .documentType(request.getDocumentType())
                .sourceType(request.getSourceType())
                .fileKey(fileKey)
                .extractedText(rawText)
                .summary(summary)
                .parsedJson(parsedJsonString)
                .build();

        GovDocument savedDoc = govDocumentRepository.save(document);

        // 3. cases 테이블 업데이트
        Case currentCase = caseRepository.findById(caseNo)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사건 번호입니다: " + caseNo));

        if (parsedFieldsNode != null) {
            String sanctionType = extractString(parsedFieldsNode, "sanctionType");
            Integer sanctionValueInt = extractInteger(parsedFieldsNode, "sanctionValue");
            String violationLaw = extractArrayAsString(parsedFieldsNode, "legalBasis");
            Short sanctionDays = sanctionValueInt != null ? sanctionValueInt.shortValue() : null;
            String businessName = extractString(parsedFieldsNode, "businessName");
            String businessAddress = extractString(parsedFieldsNode, "businessAddress");
            String title = extractString(parsedFieldsNode, "title");

            currentCase.updateSanctionInfoFromDocument(sanctionType, sanctionDays, violationLaw,
                    businessName, businessAddress, title);
        }

        // 4. 상태 전이
        switch (request.getDocumentType()) {
            case "NOTICE"   -> currentCase.updateStatus(CaseStatus.DOC_UPLOADED);
            case "ANSWER"   -> currentCase.updateStatus(CaseStatus.ANSWER_ANALYZING);
            case "DECISION" -> currentCase.updateStatus(CaseStatus.DECISION_ANALYZING);
        }

        // 5. 프론트엔드 응답 포맷으로 변환
        return DocumentUploadResponse.builder()
                .status("SUCCESS")
                .message("문서가 성공적으로 인식 및 저장되었습니다.")
                .data(DocumentUploadResponse.Data.builder()
                        .govDocNo(savedDoc.getGovDocNo())
                        .documentType(savedDoc.getDocumentType())
                        .sourceType(savedDoc.getSourceType())
                        .extractedText(savedDoc.getExtractedText())
                        .createdAt(savedDoc.getCreatedAt())
                        .parsedJson(DocumentUploadResponse.ParsedJson.builder()
                                .disposalType(extractString(parsedFieldsNode, "sanctionType"))
                                .disposalDays(extractInteger(parsedFieldsNode, "sanctionValue"))
                                .violationLaw(extractArrayAsString(parsedFieldsNode, "legalBasis"))
                                .build())
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public DocumentDetailResponse getDocumentDetail(Integer caseNo, Integer govDocNo) {
        GovDocument document = govDocumentRepository.findById(govDocNo)
                .filter(doc -> doc.getCaseNo().equals(caseNo))
                .orElseThrow(() -> new IllegalArgumentException("해당 사건에 속한 문서를 찾을 수 없거나 접근 권한이 없습니다."));

        return DocumentDetailResponse.builder()
                .status("SUCCESS")
                .message("요청이 성공했습니다.")
                .data(DocumentDetailResponse.Data.builder()
                        .govDocNo(document.getGovDocNo())
                        .documentType(document.getDocumentType())
                        .extractedText(document.getExtractedText())
                        .summary(document.getSummary())
                        .fact(document.getFact())
                        .opinion(document.getOpinion())
                        .build())
                .build();
    }

    private String extractString(JsonNode node, String key) {
        if (node != null && node.hasNonNull(key)) {
            return node.get(key).asText();
        }
        return null;
    }

    private Integer extractInteger(JsonNode node, String key) {
        if (node != null && node.hasNonNull(key) && node.get(key).canConvertToInt()) {
            return node.get(key).asInt();
        }
        return null;
    }

    private String extractArrayAsString(JsonNode node, String key) {
        if (node != null && node.hasNonNull(key) && node.get(key).isArray()) {
            List<String> list = new ArrayList<>();
            for (JsonNode item : node.get(key)) {
                list.add(item.asText());
            }
            return String.join(", ", list);
        }
        return null;
    }
}