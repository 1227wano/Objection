package com.objection.cases.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CaseStatusResponse {

    private Integer caseNo;
    private String status;
    private String stayStatus;
}
