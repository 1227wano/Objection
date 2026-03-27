package com.objection.gendocument.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AiDocumentDraftRequest {

    private Integer analysisNo;
    private String documentType;
    private CaseInfo caseInfo;
    private LegalIssueAnalysisResult legalIssueAnalysisResult;
    private StrategyPrecedentAnalysisResult strategyPrecedentAnalysisResult;
    private List<String> preparedEvidenceList;

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
    public static class LegalIssueAnalysisResult {
        private String legalIssueSummary;
        private Boolean legalWeaknessFound;
        private List<LegalIssue> legalIssues;
    }

    @Getter
    @AllArgsConstructor
    public static class LegalIssue {
        private String issueType;
        private String description;
        private String lawBasis;
        private String basisText;
        private String riskLevel;
    }

    @Getter
    @AllArgsConstructor
    public static class StrategyPrecedentAnalysisResult {
        private String claimType;
        private String appealPossibility;
        private String strategySummary;
        private List<MainPoint> mainPoints;
        private List<PrecedentInfo> precedentInfos;
    }

    @Getter
    @AllArgsConstructor
    public static class MainPoint {
        private String point;
        private String reason;
        private String sourceText;
    }

    @Getter
    @AllArgsConstructor
    public static class PrecedentInfo {
        private String precedentNo;
        private String precedentName;
        private String summary;
        private String matchReason;
        private String usagePoint;
    }
}