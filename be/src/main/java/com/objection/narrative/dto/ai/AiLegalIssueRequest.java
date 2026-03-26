package com.objection.narrative.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AiLegalIssueRequest {
    private Integer caseNo;
    private Integer govDocNo;
    private String sourceDocumentType;
    private CaseInfo caseInfo;
    private CaseContext caseContext;

    @Getter
    @AllArgsConstructor
    public static class CaseInfo {
        private String sanctionType;
        private Integer sanctionValue;
        private String rawText;
        private Map<String, Object> parsedFields;
    }

    @Getter
    @AllArgsConstructor
    public static class CaseContext {
        private String fact;
        private String opinion;
    }
}