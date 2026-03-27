package com.objection.gendocument.client;

import com.objection.gendocument.dto.ai.AiDocumentDraftRequest;
import com.objection.gendocument.dto.ai.AiDocumentDraftResponse;
import com.objection.gendocument.dto.ai.AiDocumentReviewRequest;
import com.objection.gendocument.dto.ai.AiDocumentReviewResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "aiDocumentDraftClient", url = "${ai-server.url}")
public interface AiDocumentDraftClient {

    @PostMapping("/ai/agents/document-draft")
    AiDocumentDraftResponse draftDocument(@RequestBody AiDocumentDraftRequest request);

    @PostMapping("/ai/agents/document-review")
    AiDocumentReviewResponse reviewDocument(@RequestBody AiDocumentReviewRequest request);
}