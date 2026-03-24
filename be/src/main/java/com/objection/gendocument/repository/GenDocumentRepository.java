package com.objection.gendocument.repository;

import com.objection.gendocument.entity.GenDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GenDocumentRepository extends JpaRepository<GenDocument, Integer> {

    Optional<GenDocument> findByAnalysisNoAndDocumentType(Integer analysisNo, String documentType);
}
