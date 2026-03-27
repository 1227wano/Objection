package com.objection.analysis.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MatchedPrecedentResponse {
    private String precedentNo;
    private String precedentName;
    private Float similarityScore;
}