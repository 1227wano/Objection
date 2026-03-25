package com.objection.analysis.repository;

import com.objection.analysis.entity.CaseAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseAnalysisRepository extends JpaRepository<CaseAnalysis, Integer> {
}
