export interface SubmissionSection {
  title: string;
  content: string;
}

export interface SupplementDocumentData {
  caseName: string;
  caseNo: string;
  claimantName: string;
  claimantPhone: string;
  claimantAddress: string;
  respondent: string;
  documentType: string;
  submissionContent: SubmissionSection[];
  filingDate: string;
  submitterName: string;
  committee: string;
  attachments: string[];
}
