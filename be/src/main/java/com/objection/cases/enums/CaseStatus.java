package com.objection.cases.enums;

public enum CaseStatus {

    // 파일 입력
    STARTED,                        // 사건 생성 직후
    DOC_UPLOADED,                   // 파일 입력 완료

    // 처분서 분석
    ANALYZING,                      // 처분서 분석 중
    ANALYSIS_DONE,                  // 처분서 분석 완료
    ANALYSIS_FAILED,                // 처분서 분석 실패

    // 청구서 단계
    NARRATIVE_WRITING,              // 청구서 경위 작성
    STRATEGY_GENERATING,            // 청구서 전략 도출 중
    STRATEGY_DONE,                  // 청구서 전략 도출 완료
    STRATEGY_FAILED,                // 청구서 전략 도출 실패
    CHECKLIST_WRITING,              // 체크리스트 작성
    DOC_GENERATING,                 // 청구서 작성 중
    DOC_GENERATED,                  // 청구서 작성 완료
    DOC_FAILED,                     // 청구서 작성 실패
    APPEAL_SUBMITTED,               // 청구서 단계 종료

    // 답변서 단계
    ANSWER_RECEIVED,                // 답변서 제출
    ANSWER_ANALYZING,               // 답변서 분석 중
    ANSWER_DONE,                    // 답변서 분석 완료
    ANSWER_FAILED,                  // 답변서 분석 실패

    // 보충서면 단계
    SUPPLEMENT_NARRATIVE,           // 보충서면 경위 작성
    SUPPLEMENT_GENERATING,          // 보충서면 전략 도출 중
    SUPPLEMENT_STRATEGY_DONE,       // 보충서면 전략 도출 완료
    SUPPLEMENT_STRATEGY_FAILED,     // 보충서면 전략 도출 실패
    SUPPLEMENT_DOC_GENERATING,      // 보충서면 작성 중
    SUPPLEMENT_DONE,                // 보충서면 작성 완료
    SUPPLEMENT_FAILED,              // 보충서면 작성 실패
    SUPPLEMENT_SUBMITTED,           // 보충서면 단계 종료

    // 재결서 단계
    DECISION_RECEIVED,              // 재결서 제출
    DECISION_ANALYZING,             // 재결서 분석 중
    DECISION_DONE,                  // 재결서 분석 완료
    DECISION_FAILED,                // 재결서 분석 실패

    COMPLETED                       // 사건 종결
}