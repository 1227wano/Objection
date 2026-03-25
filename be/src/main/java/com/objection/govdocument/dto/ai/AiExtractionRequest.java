package com.objection.govdocument.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AiExtractionRequest {
    private Integer caseNo;

    @JsonProperty("sourceDocumentType")
    private String documentType; // 문서 유형 (NOTICE 등)
    private String fileUrl;      // 파일 경로
}