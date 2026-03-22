package com.objection.cases.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CaseCreateResponse {

    private Integer userNo;
    private String title;
    private String status;
    private LocalDateTime createdAt;
}
