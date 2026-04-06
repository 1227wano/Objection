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
    private List<PrecedentRetrieval> precedentRetrievals;
    private AiLegalIssueRequest.AppealClaimContent appealClaimContent;

    @Getter
    @AllArgsConstructor
    public static class CaseInfo {
        private String disposalDate;
        private String agencyName;
        private String sanctionType;
        private String sanctionValue;  // Integer → String
        private Map<String, Object> parsedFields;
        private String rawText;
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

    @Getter
    @AllArgsConstructor
    public static class PrecedentRetrieval {
        private String precedentNo;
        private String precedentName;
        private String summary;
        private Float similarityScore;
    }
}