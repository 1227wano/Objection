export type AppealType = 'CANCEL' | 'INVALID' | 'ORDER';
export type PossibilityType = 'h' | 'm' | 'l' | 'z';

export interface Reason {
  title: string;
  cause: string;
  opinion: string;
}

export interface Precedent {
  caseName: string; // 사건명
  point: string;    // 유사 포인트
  result: string;   // 판결 결과
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

export const APPEAL_TYPE_MAP: Record<AppealType, string> = {
  CANCEL: '취소심판',
  INVALID: '무효등확인심판',
  ORDER: '의무이행심판',
};

export const POSSIBILITY_MAP: Record<PossibilityType, { text: string; en: string; color: string }> = {
  h: { text: '높음', en: 'Extremely High', color: 'text-blue-600' },
  m: { text: '보통', en: 'Moderate', color: 'text-green-600' },
  l: { text: '낮음', en: 'Low', color: 'text-orange-500' },
  z: { text: '매우 낮음', en: 'Very Low', color: 'text-red-500' },
};
