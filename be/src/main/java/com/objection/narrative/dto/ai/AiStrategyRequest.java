package com.objection.narrative.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AiStrategyRequest {
    private Integer caseNo;
    private Integer govDocNo;
    private String sourceDocumentType;
    private CaseInfo caseInfo;
    private CaseContext caseContext;
    private LegalIssueAnalysisResult legalIssueAnalysisResult;

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

    @Getter
    @AllArgsConstructor
    public static class LegalIssueAnalysisResult {
        private String legalIssueSummary;
        private Boolean legalWeaknessFound;
        private List<AiLegalIssueResponse.LegalIssue> legalIssues;
    }
}