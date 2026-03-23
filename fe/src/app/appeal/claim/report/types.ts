export type { RiskLevel, IssueType, LegalIssue } from '../_types/shared';
export { RISK_LEVEL_MAP } from '../_types/shared';

export type AppealType = 'CANCEL' | 'INVALID' | 'ORDER';
export type PossibilityType = 'h' | 'm' | 'l' | 'z';
export type ClaimType = 'CANCEL' | 'INVALID' | 'ORDER';
export type AppealPossibility = 'HIGH' | 'MEDIUM' | 'LOW';

// ── 기존 UI 전용 타입 ──────────────────────────────────

export interface Reason {
  title: string;
  cause: string;
  opinion: string;
  lawBasis?: string;
}

export interface Precedent {
  caseName: string; // 사건명
  point: string; // 유사 포인트
  result: string; // 판결 결과
}

export interface Evidence {
  title: string;
}

export interface ReportData {
  appealType: AppealType;
  possibility: PossibilityType;
  summation: string;
  reasons: Reason[];
  stayOfExecution: boolean;
  precedents: Precedent[];
  evidences: Evidence[];
}

// ── API 응답 타입 (Mock 기반) ──────────────────────────


export interface RepresentativePrecedent {
  precedentNo: string;
  precedentName: string;
  matchReason: string;
  usagePoint: string;
  result: string;
}

export interface MainPoint {
  point: string;
  reason: string;
  sourceText: string;
}

export interface AnalysisData {
  claimType: ClaimType;
  appealPossibility: AppealPossibility;
  legalIssueSummary: string;
  strategySummary: string;
  representativePrecedent: RepresentativePrecedent;
  legalIssues: LegalIssue[];
  mainPoints: MainPoint[];
}

export interface AnalysisResponse {
  status: string;
  message: string;
  data: AnalysisData;
}

export interface EvidenceItem {
  evidenceId: number;
  evidenceType: string;
  submitted: boolean;
  checkedAt: string | null;
}

export interface EvidenceResponse {
  status: string;
  message: string;
  data: EvidenceItem[];
}

// ── 매핑 유틸리티 ──────────────────────────────────────

export const APPEAL_TYPE_MAP: Record<AppealType, string> = {
  CANCEL: '취소심판',
  INVALID: '무효등확인심판',
  ORDER: '의무이행심판',
};

export const POSSIBILITY_MAP: Record<PossibilityType, { text: string; en: string; color: string }> =
  {
    h: { text: '높음', en: 'Extremely High', color: 'text-blue-600' },
    m: { text: '보통', en: 'Moderate', color: 'text-green-600' },
    l: { text: '낮음', en: 'Low', color: 'text-orange-500' },
    z: { text: '매우 낮음', en: 'Very Low', color: 'text-red-500' },
  };

export const APPEAL_POSSIBILITY_MAP: Record<AppealPossibility, { text: string; color: string }> = {
  HIGH: { text: '승소 확률 높음', color: 'text-blue-600' },
  MEDIUM: { text: '승소 확률 보통', color: 'text-green-600' },
  LOW: { text: '승소 확률 낮음', color: 'text-orange-500' },
};

