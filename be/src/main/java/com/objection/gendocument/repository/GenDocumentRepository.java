package com.objection.gendocument.repository;

import com.objection.gendocument.entity.GenDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenDocumentRepository extends JpaRepository<GenDocument, Integer> {
}