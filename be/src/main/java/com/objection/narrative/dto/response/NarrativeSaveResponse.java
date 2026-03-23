package com.objection.narrative.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NarrativeSaveResponse {

    private Integer caseNo;
    private LocalDateTime savedAt;
}
