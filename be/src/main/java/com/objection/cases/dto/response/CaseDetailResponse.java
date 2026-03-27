package com.objection.cases.dto.response;

import com.objection.cases.enums.CaseStatus;
import com.objection.cases.enums.ClaimType;
import com.objection.cases.enums.StayStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class CaseDetailResponse {
    private Integer caseNo;
    private Integer userNo;
    private String title;
    private CaseStatus status;
    private StayStatus stayStatus;
    private LocalDate disposalDate;
    private LocalDate awareDate;
    private String agencyName;
    private ClaimType claimType;
    private String sanctionType;
    private Short sanctionDays;
    private String claimant;
    private String violationType;
    private String businessName;
    private String businessAddress;
    private Boolean isDirect;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}