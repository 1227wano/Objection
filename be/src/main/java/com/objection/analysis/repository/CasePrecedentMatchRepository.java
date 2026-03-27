package com.objection.analysis.repository;

import com.objection.analysis.dto.response.PrecedentMatchResultDto;
import com.objection.analysis.entity.CasePrecedentMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CasePrecedentMatchRepository extends JpaRepository<CasePrecedentMatch, Integer> {

    // 💡 분석번호로 기존 매칭 내역과 판례명을 한 번에 조인하여 가져오는 네이티브 쿼리
    @Query(value = """
        SELECT 
            cpm.precedent_no AS precedentNo,
            p.precedent_name AS precedentName,
            cpm.similarity_score AS similarityScore
        FROM case_precedent_matches cpm
        JOIN precedents p ON cpm.precedent_no = p.precedent_no
        WHERE cpm.analysis_no = :analysisNo
        LIMIT 1
    """, nativeQuery = true)
    Optional<PrecedentMatchResultDto> findExistingMatchWithPrecedentName(@Param("analysisNo") Integer analysisNo);

    // 해당 분석 번호로 매칭 엔티티를 찾아오는 기본 메서드
    Optional<CasePrecedentMatch> findByAnalysisNo(Integer analysisNo);
}