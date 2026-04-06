// EmbeddingResponse.java
package com.objection.analysis.dto.ai;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class EmbeddingResponse {
    private String status;
    private String message;
    private Result result;

    @Getter
    @NoArgsConstructor
    public static class Result {
        private List<Double> embedding; // AI 서버로부터 반환받을 벡터 배열
    }
}