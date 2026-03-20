package com.objection.auth.dto.response;

public record LoginResponse (

        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        String userName

) {

    public static LoginResponse of(String accessToken, String refreshToken, long expiresIn, String userName) {
        return new LoginResponse(accessToken, refreshToken, "Bearer", expiresIn, userName);
    }
}
