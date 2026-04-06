import type { MainPoint } from '@/app/appeal/_components/MainPointCard';

export type { MainPoint };

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Reason {
  title: string;
  cause: string;
  opinion: string;
  lawBasis?: string;
}

export interface Precedent {
  caseName: string;
  point: string;
  result: string;
}

export interface Evidence {
  title: string;
}

export interface LegalIssue {
  title: string;
  description: string;
  lawBasis: string;
  basisText: string;
  riskLevel: RiskLevel;
}

export interface RepresentativePrecedent {
  precedentNo: string;
  precedentName: string;
  matchReason: string;
  usagePoint: string;
  result: string;
}

export interface SupplementAnalysisData {
  strategySummary: string;
  representativePrecedent: RepresentativePrecedent;
  legalIssues: LegalIssue[];
  mainPoints: MainPoint[];
}

export interface SupplementAnalysisResponse {
  status: string;
  message: string;
  data: SupplementAnalysisData;
}
