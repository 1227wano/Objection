package com.objection.analysis.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnalysisRequest {

    private Integer govDocNo;

    @NotNull(message = "분석 단계는 필수입니다.")
    @Pattern(regexp = "APPEAL|REPLY|DECISION", message = "지원하지 않는 분석 단계입니다.")
    private String caseStage;
}