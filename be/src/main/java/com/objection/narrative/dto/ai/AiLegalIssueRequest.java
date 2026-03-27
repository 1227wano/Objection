package com.objection.narrative.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AiLegalIssueRequest {

    private Integer caseNo;
    private Integer govDocNo;
    private String sourceDocumentType;
    private CaseInfo caseInfo;
    private CaseContext caseContext;
    private List<LawRetrieval> lawRetrievals;
    private AppealClaimContent appealClaimContent;

    @Getter
    @AllArgsConstructor
    public static class CaseInfo {
        private String disposalDate;
        private String agencyName;
        private String sanctionType;
        private Integer sanctionValue;
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
    public static class LawRetrieval {
        private String lawName;
        private String articleNo;
        private String provisionText;
    }

    @Getter
    @AllArgsConstructor
    public static class AppealClaimContent {
        private String committeeType;
        private String dispositionContent;
        private String claimPurpose;
        private String claimReason;
        private Boolean inform;
        private String informContent;
        private String awareDate;
        private String agencyName;
        private List<String> preparedEvidenceList;
    }
}