package com.objection.govdocument.repository;

import com.objection.govdocument.entity.GovDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GovDocumentRepository extends JpaRepository<GovDocument,Integer> {

    Optional<GovDocument> findByCaseNoAndDocumentType(Integer caseNo, String documentType);
}
