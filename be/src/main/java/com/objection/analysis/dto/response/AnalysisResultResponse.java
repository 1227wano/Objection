package com.objection.analysis.dto.response;

import com.fasterxml.jackson.annotation.JsonRawValue;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalysisResultResponse {

    @JsonRawValue
    private String precedentResult;
}