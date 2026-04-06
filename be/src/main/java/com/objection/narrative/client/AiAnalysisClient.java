package com.objection.narrative.client;

import com.objection.narrative.dto.ai.AiLegalIssueRequest;
import com.objection.narrative.dto.ai.AiLegalIssueResponse;
import com.objection.narrative.dto.ai.AiStrategyRequest;
import com.objection.narrative.dto.ai.AiStrategyResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "aiAnalysisClient", url = "${ai-server.url:http://localhost:8000}")
public interface AiAnalysisClient {

    @PostMapping("/ai/agents/legal-issue-analysis")
    AiLegalIssueResponse analyzeLegalIssue(@RequestBody AiLegalIssueRequest request);

    @PostMapping("/ai/agents/strategy-precedent-analysis")
    AiStrategyResponse analyzeStrategy(@RequestBody AiStrategyRequest request);
}