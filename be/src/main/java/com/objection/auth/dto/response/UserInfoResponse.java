package com.objection.auth.dto.response;


public record UserInfoResponse (

        Integer userNo,
        String userId,
        String userName

) {
    public static UserInfoResponse of(Integer userNo, String userId, String userName) {
        return new UserInfoResponse(userNo, userId, userName);
    }
}
