package com.objection.evidence.dto.response;

import com.objection.evidence.entity.EvidenceDocument;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EvidenceResponse {

    private Integer evidenceId;
    private String evidenceType;
    private Boolean submitted;
    private LocalDateTime checkedAt;

    public static EvidenceResponse from(EvidenceDocument evidence) {

        return EvidenceResponse.builder()
                .evidenceId(evidence.getEvidenceId())
                .evidenceType(evidence.getEvidenceType())
                .submitted(evidence.getSubmitted())
                .checkedAt(evidence.getCheckedAt())
                .build();
    }
}
