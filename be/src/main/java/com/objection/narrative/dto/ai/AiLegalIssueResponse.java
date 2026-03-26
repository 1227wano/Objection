package com.objection.narrative.dto.ai;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class AiLegalIssueResponse {
    private Integer caseNo;
    private String status;
    private String message;
    private Result result;

    @Getter
    @NoArgsConstructor
    public static class Result {
        private String legalIssueSummary;
        private Boolean legalWeaknessFound;
        private List<LegalIssue> legalIssues;
    }

    @Getter
    @NoArgsConstructor
    public static class LegalIssue {
        private String issueType;
        private String description;
        private String lawBasis;
        private String basisText;
        private String riskLevel;
    }
}