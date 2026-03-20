package com.objection.domain.user.controller;

import com.objection.auth.dto.response.UserInfoResponse;
import com.objection.common.response.ApiResponse;
import com.objection.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfoResponse>> me(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(ApiResponse.success("인증이 확인되었습니다.",
                UserInfoResponse.of(userDetails.getUserNo(),    // userNo
                        userDetails.getUsername(),  // userId
                        userDetails.getUserName())   // userName
        ));
    }
}
