package com.objection.govdocument.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "gov_documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class GovDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "gov_doc_seq")
    @SequenceGenerator(name = "gov_doc_seq", sequenceName = "gov_documents_gov_doc_no_seq", allocationSize = 1)
    private Integer govDocNo;

    @Column(nullable = false)
    private Integer caseNo;

    @Column(nullable = false, length = 13)
    private String documentType;

    @Column(length = 6)
    private String sourceType;

    @Column(length = 255)
    private String fileKey;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String parsedJson;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String fact;

    @Column(columnDefinition = "TEXT")
    private String opinion;

    public void updateNarrative(String fact, String opinion) {
        this.fact=fact;
        this.opinion=opinion;
    }


}
