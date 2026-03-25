package com.objection.analysis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "case_analysis")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CaseAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "analysis_seq")
    @SequenceGenerator(name = "analysis_seq", sequenceName = "case_analysis_analysis_no_seq", allocationSize = 1)
    private Integer analysisNo;

    @Column(nullable = false)
    private Integer govDocNo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String lawResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String precedentResult;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
