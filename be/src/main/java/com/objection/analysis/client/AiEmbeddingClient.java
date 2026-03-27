// AiEmbeddingClient.java
package com.objection.analysis.client;

import com.objection.analysis.dto.ai.EmbeddingRequest;
import com.objection.analysis.dto.ai.EmbeddingResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// application.yml에 있는 ai-server.url 값을 읽어옵니다.
@FeignClient(name = "aiEmbeddingClient", url = "${ai-server.url}")
public interface AiEmbeddingClient {

    @PostMapping(value = "/ai/agents/text-embedding", consumes = "application/json")
    EmbeddingResponse getEmbedding(@RequestBody EmbeddingRequest request);
}