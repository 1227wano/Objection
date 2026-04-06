// EmbeddingRequest.java
package com.objection.analysis.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmbeddingRequest {
    private String text; // 병합된 텍스트가 들어갈 필드
}