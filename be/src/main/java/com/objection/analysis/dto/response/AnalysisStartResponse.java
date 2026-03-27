package com.objection.analysis.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalysisStartResponse {

    private Integer analysisNo;
    private String caseStage;
    private String status;
    private Integer estimatedSeconds;
}