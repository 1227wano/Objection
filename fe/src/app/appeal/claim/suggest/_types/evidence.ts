// src/app/appeal/claim/suggest/_types/evidence.ts

export interface Evidence {
  evidenceId: number;
  evidenceType: string;
  submitted: boolean;
  checkedAt: string | null;
}

export interface EvidenceResponse {
  status: string;
  message: string;
  data: Evidence[];
}
