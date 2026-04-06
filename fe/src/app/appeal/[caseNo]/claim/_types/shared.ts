export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type IssueType = 'FACT_MISUNDERSTANDING' | 'PROPORTIONALITY' | string;

export interface LegalIssue {
  issueType: IssueType;
  title: string;
  description: string;
  lawBasis: string;
  basisText: string;
  riskLevel: RiskLevel;
}

export const RISK_LEVEL_MAP: Record<RiskLevel, { text: string; color: string }> = {
  HIGH: { text: '높음', color: 'text-red-500' },
  MEDIUM: { text: '보통', color: 'text-orange-500' },
  LOW: { text: '낮음', color: 'text-green-600' },
};
