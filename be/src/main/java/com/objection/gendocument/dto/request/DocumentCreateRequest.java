package com.objection.gendocument.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DocumentCreateRequest {

    @NotBlank(message = "문서 유형을 입력해주세요.")
    private String documentType; // APPEAL_CLAIM / SUPPLEMENT_STATEMENT

    private String userInput; // 사용자 보완 의견

}
