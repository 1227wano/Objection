package com.objection.govdocument.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentDetailResponse {
    private String status;
    private String message;
    private Data data;

    @Getter @Builder
    public static class Data {
        private Integer govDocNo;
        private String documentType;
        private String extractedText;
        private String summary;
        private String fact;
        private String opinion;
    }
}