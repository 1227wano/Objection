// 적법요건 판단 결과 조회 API 응답 타입
export interface CaseApiResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: CaseData;
}

export interface CaseData {
  caseNo: number;
  title: string;
  status: string;
  stayStatus: string;
  claimType: 'CANCEL' | 'INVALID' | 'ORDER' | null;
  sanctionType: string | null;
  sanctionDays: number | null;
  agencyName: string | null;
  violationType: string | null;
  businessName: string | null;
  businessAddress: string | null;
  disposalDate: string | null;
  awareDate: string | null;
  claimant: string | null;
  isDirect: boolean | null;
  createdAt: string;
  updatedAt: string;
}

// 프론트 UI용 타입
export interface Eligibility {
  id: number;
  title: string;
  status: 'pass' | 'warning' | 'fail';
  description: string;
}

export interface AnalysisData {
  summary: string;
  originalText: string;
  deadline: string;
  eligibility: Eligibility[];
  details?: { label: string; value: string }[];
}
