package com.objection.narrative.dto.ai;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class AiStrategyResponse {
    private Integer caseNo;
    private Integer govDocNo;
    private String status;
    private String message;
    private Result result;
    private List<String> warnings;

    @Getter
    @NoArgsConstructor
    public static class Result {
        private String claimType;
        private String appealPossibility;
        private String strategySummary;
        private List<MainPoint> mainPoints;
        private Boolean stayRecommended;
        private List<PrecedentInfo> precedentInfos;
        private List<String> recommendedEvidence;
    }

    @Getter
    @NoArgsConstructor
    public static class MainPoint {
        private String point;
        private String reason;
        private String sourceText;
    }

    @Getter
    @NoArgsConstructor
    public static class PrecedentInfo {
        private String precedentNo;
        private String precedentName;
        private String summary;
        private String matchReason;
        private String usagePoint;
    }
}