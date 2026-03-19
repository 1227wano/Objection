package com.objection.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailVerifyRequest (

        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        @NotBlank(message = "인증 코드를 입력해주세요.")
        String code,

        @NotBlank(message = "인증 목적을 입렵해주세요.")
        String purpose
) {}

