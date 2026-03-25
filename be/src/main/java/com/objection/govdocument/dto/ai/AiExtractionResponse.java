package com.objection.govdocument.dto.ai;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.Map;

@Getter
@NoArgsConstructor
public class AiExtractionResponse {
    private Integer caseNo;
    private String status;
    private String message;
    private Result result;

    @Getter @NoArgsConstructor
    public static class Result {
        private String sourceDocumentType;
        private String rawText;
        private String summary;
        private Map<String, Object> parsedFields; // 가변적인 JSON 데이터 통째로 받기
    }
}