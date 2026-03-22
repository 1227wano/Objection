package com.objection.common.exception;

import com.objection.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 - 입력 값 유효성 검사 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(filedError -> filedError.getDefaultMessage())
                .orElse("입력 값이 올바르지 않습니다.");
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(message));
    }

    // 401 - 유효하지 않은 토큰
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail("유효하지 않은 토큰입니다."));
    }

    // 403 - 접근 권한 없음
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessException(AccessDeniedException e) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.fail(e.getMessage()));
    }

   // 404 - 리소스 없음
   @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.fail(e.getMessage()));
   }

    // 409 - 중복 데이터
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException e) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.fail(e.getMessage()));
   }

   // 410 - 만료된 데이터 (이메일 인증 코드 등)
   @ExceptionHandler(ExpiredCodeException.class)
   public ResponseEntity<ApiResponse<Void>> handleExpiredCodeException(ExpiredCodeException e) {
        return ResponseEntity
                .status(HttpStatus.GONE)
                .body(ApiResponse.fail(e.getMessage()));
   }

    // 500 - 서버 내부 오류
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
            log.error("서버 내부 오류 발생", e);  // ← 이 줄 추가!
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("서버 내부 오류가 발생했습니다."));
        }
    }
