package com.objection.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmailSendRequest (

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    String email,

    @NotBlank(message = "인증 목적을 입력해주세요.")
    @Pattern(regexp = "SIGNUP|PASSWORD_RESET", message = "purpose는 SIGNUP 또는 PASSWORD_RESET이어야 합니다.")
    String purpose
) {}
