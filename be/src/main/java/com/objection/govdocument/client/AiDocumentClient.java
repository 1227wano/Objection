package com.objection.govdocument.client;

import com.objection.govdocument.dto.ai.AiExtractionRequest;
import com.objection.govdocument.dto.ai.AiExtractionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "aiDocumentClient", url = "${ai-server.url:http://localhost:8000}")
public interface AiDocumentClient {
    @PostMapping("/ai/agents/document-extract")
    AiExtractionResponse extractDocument(@RequestBody AiExtractionRequest request);
}