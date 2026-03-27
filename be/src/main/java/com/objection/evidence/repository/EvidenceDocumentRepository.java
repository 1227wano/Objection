package com.objection.evidence.repository;

import com.objection.evidence.entity.EvidenceDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvidenceDocumentRepository extends JpaRepository<EvidenceDocument,Integer> {

    List<EvidenceDocument> findAllByAnalysisNo(Integer analysisNo);

    Optional<EvidenceDocument> findByEvidenceIdAndAnalysisNo(Integer evidenceId, Integer analysisNo);

    List<EvidenceDocument> findAllByAnalysisNoOrderByEvidenceIdAsc(Integer analysisNo);

}
