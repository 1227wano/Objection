package com.objection.govdocument.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class DocumentUploadResponse {
    private String status;
    private String message;
    private Data data;

    @Getter @Builder
    public static class Data {
        private Integer govDocNo;
        private String documentType;
        private String sourceType;
        private String extractedText;
        private ParsedJson parsedJson;
        private LocalDateTime createdAt;
    }

    @Getter @Builder
    public static class ParsedJson {
        private String disposalType;
        private Integer disposalDays;
        private String violationLaw;
    }
}