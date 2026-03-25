package com.objection.evidence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evidence_documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EvidenceDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "evidence_seq")
    @SequenceGenerator(name = "evidence_seq", sequenceName = "evidence_documents_evidence_id_seq", allocationSize = 1)
    private Integer evidenceId;

    @Column(nullable = false)
    private Integer analysisNo;

    @Column(nullable = false, length = 50)
    private String evidenceType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean submitted = false;

    private LocalDateTime checkedAt;

    public void updateSubmitted(Boolean submitted) {
        this.submitted = submitted;
        this.checkedAt = submitted ? LocalDateTime.now() : null;
    }

}
