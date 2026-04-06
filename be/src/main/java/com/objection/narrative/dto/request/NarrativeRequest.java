package com.objection.narrative.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NarrativeRequest {

    @NotBlank(message = "사실관계를 작성해주세요.")
    private String fact;

    @NotBlank(message = "부당하다고 생각하는 이유를 작성해주세요.")
    private String opinion;

}
