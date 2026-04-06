package com.objection.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetRequest (

        @NotBlank(message = "아이디를 입력해주세요.")
        String userId,

        @NotBlank(message = "인증 코드를 입력해주세요.")
        String code,

        @NotBlank(message = "새 비밀번호를 입력해주세요.")
        @Size(min = 8, message = "비밀번호는 8자 이상 입력해주세요.")
        String newPw

){}

