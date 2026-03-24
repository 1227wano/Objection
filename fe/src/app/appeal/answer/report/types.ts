import { MainPoint } from '../../claim/report/types';

export type { MainPoint };

export interface RebuttalAnalysisData {
  respondentSummary: string;
  strategySummary: string;
  mainPoints: MainPoint[];
}

export interface RebuttalAnalysisResponse {
  status: string;
  message: string;
  data: RebuttalAnalysisData;
}
