package com.objection.analysis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "case_precedent_matches")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CasePrecedentMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "match_seq")
    @SequenceGenerator(name = "match_seq", sequenceName = "case_precedent_matches_match_no_seq", allocationSize = 1)
    @Column(name = "match_no")
    private Integer matchNo;

    @Column(name = "analysis_no", nullable = false)
    private Integer analysisNo;

    @Column(name = "precedent_no", nullable = false, length = 50)
    private String precedentNo;

    @Column(name = "similarity_score", nullable = false)
    private Float similarityScore;

    @Column(name = "rank")
    private Short rank;

    @Column(name = "match_reason", columnDefinition = "TEXT")
    private String matchReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 엔티티 내부의 값을 안전하게 변경하기 위한 메서드 추가
    public void updateMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }
}