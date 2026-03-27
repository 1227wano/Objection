package com.objection.gendocument.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AiDocumentReviewRequest {

    private Integer analysisNo;
    private String documentType;
    private DraftDocument draftDocument;
    private CaseInfo caseInfo;
    private LegalIssueAnalysisResult legalIssueAnalysisResult;
    private StrategyPrecedentAnalysisResult strategyPrecedentAnalysisResult;
    private List<String> preparedEvidenceList;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DraftDocument {
        private Map<String, Object> contentJson;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaseInfo {
        private String agencyName;
        private String sanctionType;
        private String sanctionValue;
        private Map<String, Object> parsedFields;
        private String rawText;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LegalIssueAnalysisResult {
        private String legalIssueSummary;
        private Boolean legalWeaknessFound;
        private List<LegalIssue> legalIssues;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LegalIssue {
        private String issueType;
        private String description;
        private String lawBasis;
        private String basisText;
        private String riskLevel;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StrategyPrecedentAnalysisResult {
        private String claimType;
        private String appealPossibility;
        private String strategySummary;
        private List<MainPoint> mainPoints;
        private List<PrecedentInfo> precedentInfos;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MainPoint {
        private String point;
        private String reason;
        private String sourceText;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrecedentInfo {
        private String precedentNo;
        private String precedentName;
        private String summary;
        private String matchReason;
        private String usagePoint;
    }
}