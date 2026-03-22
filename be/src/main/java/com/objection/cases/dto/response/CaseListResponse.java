package com.objection.cases.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CaseListResponse {

    private Integer caseNo;
    private String title;
    private String status;
    private String stayStatus;
    private String claimType;
    private String sanctionType;
    private Short sanctionDays;
    private String agencyName;
    private LocalDateTime createdAt;

}
