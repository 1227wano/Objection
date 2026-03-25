package com.objection.evidence.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EvidenceUpdateRequest {

    @NotNull
    private Boolean submitted;
}
