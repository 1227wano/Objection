package com.objection.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.objection.analysis.client.AiEmbeddingClient;
import com.objection.analysis.dto.ai.EmbeddingRequest;
import com.objection.analysis.dto.ai.EmbeddingResponse;
import com.objection.analysis.dto.response.PrecedentMatchResultDto;
import com.objection.analysis.entity.CaseAnalysis;
import com.objection.analysis.entity.CasePrecedentMatch;
import com.objection.analysis.repository.CaseAnalysisRepository;
import com.objection.analysis.repository.CasePrecedentMatchRepository;
import com.objection.govdocument.entity.GovDocument;
import com.objection.govdocument.repository.GovDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrecedentMatchingService {

    private final CaseAnalysisRepository caseAnalysisRepository;
    private final GovDocumentRepository govDocumentRepository;
    private final CasePrecedentMatchRepository casePrecedentMatchRepository;
    private final AiEmbeddingClient aiEmbeddingClient;
    private final ObjectMapper objectMapper; // JSON 파싱용

    @Transactional
    public PrecedentMatchResultDto matchPrecedent(Integer analysisNo) {

        // 0. 이미 매칭된 결과가 있는지 확인
        Optional<PrecedentMatchResultDto> existingMatch =
                casePrecedentMatchRepository.findExistingMatchWithPrecedentName(analysisNo);

        if (existingMatch.isPresent()) {
            log.info("이미 매칭된 판례가 존재하여 기존 결과를 반환합니다. AnalysisNo: {}", analysisNo);
            // AI 호출 및 DB 쿼리 생략하고 즉시 리턴! (판례명도 포함되어 있음)
            return existingMatch.get();
        }

        // 1. 분석 결과(CaseAnalysis) 및 원본 문서(GovDocument) 조회
        CaseAnalysis caseAnalysis = caseAnalysisRepository.findByAnalysisNo(analysisNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 분석 결과를 찾을 수 없습니다. 분석번호: " + analysisNo));

        GovDocument govDoc = govDocumentRepository.findById(caseAnalysis.getGovDocNo())
                .orElseThrow(() -> new IllegalArgumentException("원본 문서를 찾을 수 없습니다. 문서번호: " + caseAnalysis.getGovDocNo()));

        // 2. 법령 정보 파싱 및 텍스트 조합 (parsed_json에서 legalBasis 추출)
        String lawRetrievalsText = extractAndFetchLawRetrieval(govDoc.getParsedJson());

        // 3. AI 임베딩에 보낼 텍스트 병합 (원문 -> 관련법 -> 사실관계 -> 본인입장 순서)
        StringBuilder combinedTextBuilder = new StringBuilder();
        appendIfNotNull(combinedTextBuilder, govDoc.getExtractedText());
        appendIfNotNull(combinedTextBuilder, lawRetrievalsText);
        appendIfNotNull(combinedTextBuilder, govDoc.getFact());
        appendIfNotNull(combinedTextBuilder, govDoc.getOpinion());

        String targetText = combinedTextBuilder.toString().trim();
        log.info("임베딩 요청 텍스트 길이: {}", targetText.length());

        // 4. AI 임베딩 API 호출
        EmbeddingRequest request = EmbeddingRequest.builder().text(targetText).build();
        EmbeddingResponse response = aiEmbeddingClient.getEmbedding(request);

        if (response == null || !"SUCCESS".equals(response.getStatus()) || response.getResult() == null) {
            throw new RuntimeException("AI 서버에서 임베딩을 가져오는데 실패했습니다.");
        }

        // 5. 문자열 벡터 변환
        String vectorString = response.getResult().getEmbedding().toString();

        // 6. 유사 판례 1개 조회
        List<PrecedentMatchResultDto> matchedList = caseAnalysisRepository.findTop3SimilarPrecedents(vectorString);

        if (matchedList == null || matchedList.isEmpty()) {
            throw new RuntimeException("유사한 판례를 찾을 수 없습니다.");
        }

        PrecedentMatchResultDto topMatch = matchedList.get(0);

        // 7. 매칭 결과를 case_precedent_matches 테이블에 저장
        CasePrecedentMatch matchEntity = CasePrecedentMatch.builder()
                .analysisNo(analysisNo)
                .precedentNo(topMatch.getPrecedentNo())
                .similarityScore(topMatch.getSimilarityScore().floatValue())
                .build();

        casePrecedentMatchRepository.save(matchEntity);
        log.info("판례 매칭 결과 새롭게 저장 완료. AnalysisNo: {}, PrecedentNo: {}", analysisNo, topMatch.getPrecedentNo());

        // 8. 반환
        return topMatch;
    }

    /**
     * JSON에서 legalBasis를 추출하여 DB에서 법령 내용을 찾아 합체하는 헬퍼 메서드
     */
    private String extractAndFetchLawRetrieval(String parsedJson) {
        if (parsedJson == null || parsedJson.isBlank()) return null;

        try {
            JsonNode rootNode = objectMapper.readTree(parsedJson);
            if (rootNode.has("legalBasis")) {
                String legalBasis = rootNode.get("legalBasis").asText(); // ex: "식품위생법 제44조"
                String[] parts = legalBasis.split(" ");

                if (parts.length >= 2) {
                    String lawName = parts[0];   // "식품위생법"
                    String articleNo = parts[1]; // "제44조"

                    // Native Query로 법령 내용 조회
                    String provisionText = caseAnalysisRepository.findProvisionTextByLawNameAndArticle(lawName, articleNo);

                    if (provisionText != null) {
                        return "lawRetrievals(관련 법): " + legalBasis + " " + provisionText;
                    }
                }
                return "lawRetrievals(관련 법): " + legalBasis; // 법령 내용을 못 찾으면 법 이름이라도 추가
            }
        } catch (Exception e) {
            log.warn("JSON 파싱 중 오류 발생 (무시하고 계속 진행): {}", e.getMessage());
        }
        return null;
    }

    /**
     * 텍스트가 null이 아니면 개행과 함께 StringBuilder에 추가하는 헬퍼 메서드
     */
    private void appendIfNotNull(StringBuilder sb, String text) {
        if (text != null && !text.isBlank()) {
            sb.append(text).append("\n");
        }
    }

    // A-2(판례/전략 Agent) API 연결할때 사용해!
    @Transactional
    public void updateMatchReason(Integer analysisNo, String matchReason) {
        CasePrecedentMatch match = casePrecedentMatchRepository.findByAnalysisNo(analysisNo)
                .orElseThrow(() -> new IllegalArgumentException("매칭된 판례 이력이 없습니다."));

        // 엔티티에 updateMatchReason 같은 변경 감지용(Dirty Checking) 메서드를 만들어두고 호출
        match.updateMatchReason(matchReason);
    }
}