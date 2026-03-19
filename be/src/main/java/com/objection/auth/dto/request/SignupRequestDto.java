package com.objection.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequestDto (

    @NotBlank(message = "아이디를 입력해주세요.")
    @Size(max = 15, message = "아이디는 15자 이하로 입력해주세요.")
    String userId,

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 8, message = "비밀번호는 8자 이상 입력해주세요.")
    String userPw,

    @NotBlank(message = "이름을 입력해주세요.")
    @Size(max = 20, message = "이름은 20자 이하로 입력해주세요.")
    String userName

){}
