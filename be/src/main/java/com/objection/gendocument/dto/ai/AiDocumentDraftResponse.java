package com.objection.gendocument.dto.ai;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
public class AiDocumentDraftResponse {

    private String status;
    private String message;
    private Result result;
    private Object warnings;

    @Getter
    @NoArgsConstructor
    public static class Result {
        private Integer analysisNo;
        private String documentType;
        private Map<String, Object> contentJson;
    }
}