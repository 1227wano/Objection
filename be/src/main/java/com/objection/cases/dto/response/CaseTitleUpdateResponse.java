package com.objection.cases.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CaseTitleUpdateResponse {

    private Integer caseNo;
    private String title;
    private LocalDateTime updatedAt;
}
