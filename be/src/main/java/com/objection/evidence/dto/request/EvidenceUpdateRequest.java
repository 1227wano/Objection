package com.objection.evidence.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EvidenceUpdateRequest {

    @NotNull
    private Boolean submitted;
}
