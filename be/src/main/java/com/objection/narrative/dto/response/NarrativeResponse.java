package com.objection.narrative.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NarrativeResponse {

    private Integer caseNo;
    private String fact;
    private String opinion;
}
