package com.objection.cases.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SurveySaveResponse {

    private Integer caseNo;
    private LocalDateTime updatedAt;
}
