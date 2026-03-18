package com.objection.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final String status;
    private final String message;
    private final T data;


    public ApiResponse(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public static<T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data);
    }

    public static<T> ApiResponse<T> success(String message) {
        return new ApiResponse<>("SUCCESS", message, null);
    }

    public static<T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>("FAIL", message, null);
    }

    public static<T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("ERROR", message, null);
    }

}
