package com.objection.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 - 유효성 검사
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력 값이 올바르지 않습니다."),
    CODE_INVALID(HttpStatus.BAD_REQUEST, "인증 코드가 올바르지 않습니다."),
    ANALYSIS_NOT_COMPLETE(HttpStatus.BAD_REQUEST, "분석이 완료되지 않은 상태입니다."),

    // 401 - 인증
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."),
    REFRESH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "유효하지 않은 Refresh Token입니다."),

    // 403 - 권한
    CASE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "본인 사건이 아닙니다."),
    DOCUMENT_ACCESS_DENIED(HttpStatus.FORBIDDEN, "해당 문서에 대한 접근 권한이 없습니다."),

    // 404 - 리소스 없음
    CASE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사건입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."),
    GOV_DOC_NOT_FOUND(HttpStatus.NOT_FOUND, "처분서가 업로드되지 않았습니다."),
    ANALYSIS_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 분석입니다."),
    DOCUMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "생성된 문서가 없습니다."),

    // 409 - 중복
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 아이디입니다."),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 이메일입니다."),

    // 410 - 만료
    CODE_EXPIRED(HttpStatus.GONE, "인증 코드가 만료되었습니다."),
    REFRESH_TOKEN_EXPIRED(HttpStatus.GONE, "만료된 Refresh Token입니다."),

    // 500 - 서버 오류
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    DOCUMENT_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "문서 생성에 실패했습니다."),
    PDF_CONVERT_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "PDF 변환에 실패했습니다.");

    private final HttpStatus status;
    private final String message;
}