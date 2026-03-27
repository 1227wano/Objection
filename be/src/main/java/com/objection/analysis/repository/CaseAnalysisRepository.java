package com.objection.analysis.repository;

import com.objection.analysis.dto.response.PrecedentMatchResultDto;
import com.objection.analysis.entity.CaseAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CaseAnalysisRepository extends JpaRepository<CaseAnalysis, Integer> {

    Optional<CaseAnalysis> findByAnalysisNo(Integer analysisNo);

    // 1. 법령 텍스트 조회용 네이티브 쿼리 (엔티티 불필요)
    @Query(value = """
        SELECT lp.provision_text 
        FROM laws_provisions lp 
        JOIN laws l ON lp.law_no = l.law_no 
        WHERE l.law_name = :lawName AND lp.article_no = :articleNo 
        LIMIT 1
    """, nativeQuery = true)
    String findProvisionTextByLawNameAndArticle(@Param("lawName") String lawName, @Param("articleNo") String articleNo);

    // 2. 판례 벡터 매칭용 네이티브 쿼리 (엔티티 불필요)
    // 파이썬 코드에서 생성한 precedents, precedent_vectors 테이블 조인
    @Query(value = """
        SELECT 
            p.precedent_no AS precedentNo,
            p.precedent_name AS precedentName,
            1 - (v.vector_data <=> CAST(:targetVector AS vector)) AS similarityScore
        FROM precedents p
        JOIN precedent_vectors v ON p.precedent_no = v.precedent_no
        ORDER BY v.vector_data <=> CAST(:targetVector AS vector)
        LIMIT 1
    """, nativeQuery = true)
    List<PrecedentMatchResultDto> findTop3SimilarPrecedents(@Param("targetVector") String targetVector);
}