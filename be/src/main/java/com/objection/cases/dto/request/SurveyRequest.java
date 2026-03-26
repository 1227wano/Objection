package com.objection.cases.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SurveyRequest {

    private Boolean isDirect;
    private String sanctionType;
    private String disposalDate;
    private String awareDate;
    private String agencyName;
    private Boolean hasDocument;
}