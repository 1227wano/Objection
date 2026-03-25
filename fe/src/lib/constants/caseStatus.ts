import { StageName } from '@/lib/appeal-progress';

export interface CaseStatusInfo {
  label: string;
  href: string;
  majorStage: StageName;
  detailStep: string;
}

export const CASE_STATUS_MAP = {
  // 처분서 단계
  STARTED: { label: '사건 생성 직후', href: '/appeal/start', majorStage: '처분서 분석', detailStep: '처분서 첨부' },
  DOC_UPLOADED: { label: '파일 입력 완료', href: '/appeal/start', majorStage: '처분서 분석', detailStep: '처분서 분석 대기' },
  ANALYZING: { label: '처분서 분석 중', href: '/appeal/loading', majorStage: '처분서 분석', detailStep: '처분서 분석 중' },
  ANALYSIS_DONE: { label: '처분서 분석 완료', href: '/appeal/analysis', majorStage: '처분서 분석', detailStep: '분석 결과 검토' },
  ANALYSIS_FAILED: { label: '처분서 분석 실패', href: '/appeal/error', majorStage: '처분서 분석', detailStep: '분석 실패' },
  
  // 청구서 작성 단계
  NARRATIVE_WRITING: { label: '청구서 경위 작성', href: '/appeal/claim/incident', majorStage: '행정심판청구서 작성', detailStep: '사건 경위 작성' },
  STRATEGY_GENERATING: { label: '청구서 전략 도출 중', href: '/appeal/loading', majorStage: '행정심판청구서 작성', detailStep: '전략 도출 중' },
  STRATEGY_DONE: { label: '청구서 전략 도출 완료', href: '/appeal/claim/report', majorStage: '행정심판청구서 작성', detailStep: 'AI 분석 결과' },
  STRATEGY_FAILED: { label: '청구서 전략 도출 실패', href: '/appeal/error', majorStage: '행정심판청구서 작성', detailStep: '전략 도출 실패' },
  CHECKLIST_WRITING: { label: '체크리스트 작성', href: '/appeal/claim/suggest', majorStage: '행정심판청구서 작성', detailStep: 'AI 제안' },
  DOC_GENERATING: { label: '청구서 작성 중', href: '/appeal/loading', majorStage: '행정심판청구서 작성', detailStep: '문서작성' },
  DOC_GENERATED: { label: '청구서 작성 완료', href: '/appeal/claim/write', majorStage: '행정심판청구서 작성', detailStep: '문서작성' },
  DOC_FAILED: { label: '청구서 작성 실패', href: '/appeal/error', majorStage: '행정심판청구서 작성', detailStep: '작성 실패' },
  APPEAL_SUBMITTED: { label: '청구서 단계 종료', href: '/appeal/claim/complete', majorStage: '행정심판청구서 작성', detailStep: '완료' },
  
  // 답변서 단계
  ANSWER_RECEIVED: { label: '답변서 제출', href: '/appeal/answer/upload', majorStage: '답변서 분석', detailStep: '답변서 첨부' },
  ANSWER_ANALYZING: { label: '답변서 분석 중', href: '/appeal/loading', majorStage: '답변서 분석', detailStep: '답변서 분석 중' },
  ANSWER_DONE: { label: '답변서 분석 완료', href: '/appeal/answer/report', majorStage: '답변서 분석', detailStep: 'AI 분석 결과' },
  ANSWER_FAILED: { label: '답변서 분석 실패', href: '/appeal/error', majorStage: '답변서 분석', detailStep: '분석 실패' },
  
  // 보충서면 단계
  SUPPLEMENT_NARRATIVE: { label: '보충서면 경위 작성', href: '/appeal/supplement/case', majorStage: '보충서면 작성', detailStep: '보충 경위서 작성' },
  SUPPLEMENT_GENERATING: { label: '보충서면 전략 도출 중', href: '/appeal/loading', majorStage: '보충서면 작성', detailStep: '전략 도출 중' },
  SUPPLEMENT_STRATEGY_DONE: { label: '보충서면 전략 도출 완료', href: '/appeal/supplement/suggest', majorStage: '보충서면 작성', detailStep: 'AI 제안' },
  SUPPLEMENT_STRATEGY_FAILED: { label: '보충서면 전략 도출 실패', href: '/appeal/error', majorStage: '보충서면 작성', detailStep: '전략 도출 실패' },
  SUPPLEMENT_DOC_GENERATING: { label: '보충서면 작성 중', href: '/appeal/loading', majorStage: '보충서면 작성', detailStep: '문서작성' },
  SUPPLEMENT_DONE: { label: '보충서면 작성 완료', href: '/appeal/supplement/write', majorStage: '보충서면 작성', detailStep: '문서작성' },
  SUPPLEMENT_FAILED: { label: '보충서면 작성 실패', href: '/appeal/error', majorStage: '보충서면 작성', detailStep: '작성 실패' },
  SUPPLEMENT_SUBMITTED: { label: '보충서면 단계 종료', href: '/appeal/supplement/complete', majorStage: '보충서면 작성', detailStep: '완료' },
  
  // 재결서 단계
  DECISION_RECEIVED: { label: '재결서 제출', href: '/appeal/ruling/upload', majorStage: '재결서 분석', detailStep: '재결서 첨부' },
  DECISION_ANALYZING: { label: '재결서 분석 중', href: '/appeal/loading', majorStage: '재결서 분석', detailStep: '재결서 분석 중' },
  DECISION_DONE: { label: '재결서 분석 완료', href: '/appeal/ruling/analysis', majorStage: '재결서 분석', detailStep: '재결서 분석' },
  DECISION_FAILED: { label: '재결서 분석 실패', href: '/appeal/error', majorStage: '재결서 분석', detailStep: '분석 실패' },
  COMPLETED: { label: '사건 종결', href: '/appeal/ruling/analysis', majorStage: '행정심판 완료', detailStep: '' },
} satisfies Record<string, CaseStatusInfo>;

export type CaseStatus = keyof typeof CASE_STATUS_MAP;
