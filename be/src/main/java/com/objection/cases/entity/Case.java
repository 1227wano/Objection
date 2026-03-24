package com.objection.cases.entity;

import com.objection.cases.enums.CaseStatus;
import com.objection.cases.enums.ClaimType;
import com.objection.cases.enums.StayStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cases")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "case_seq")
    @SequenceGenerator(name = "case_seq", sequenceName = "cases_case_no_seq", allocationSize = 1)
    private Integer caseNo;

    @Column(nullable = false)
    private Integer userNo;

    @Column(nullable = false, length = 50)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 19)
    private CaseStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StayStatus stayStatus;

    private LocalDate disposalDate;

    private LocalDate awareDate;

    @Column(length = 30)
    private String agencyName;

    @Enumerated(EnumType.STRING)
    @Column(length = 7)
    private ClaimType claimType;

    @Column(length = 20)
    private String sanctionType;

    private Short sanctionDays;

    @Column(length = 10)
    private String claimant;

    @Column(length = 20)
    private String violationType;

    @Column(length = 50)
    private String businessName;

    @Column(length = 100)
    private String businessAddress;

    private Boolean isDirect;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void updateTitle(String title) {
        this.title = title;
    }

    public void updateSurvey(Boolean isDirect, String sanctionType,
                             LocalDate disposalDate, LocalDate awareDate,
                             String agencyName) {
        this.isDirect = isDirect;
        this.sanctionType = sanctionType;
        this.disposalDate = disposalDate;
        this.awareDate = awareDate;
        this.agencyName = agencyName;
    }

    public void updateStatus(CaseStatus status) {
        this.status = status;
    }
}
