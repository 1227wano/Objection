'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import CompletionHeader from '../../claim/complete/_components/CompletionHeader';
import SupplementFileDownloadTab from './_components/SupplementFileDownloadTab';
import { SupplementDocumentData, SubmissionSection } from '../write/_types/document';
import { apiClient } from '@/lib/api-client';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveAnalysisNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY)
  );
}

function parseSubmissionContent(text: string): SubmissionSection[] {
  const normalized = text.replace(/\\n/g, '\n');
  const lines = normalized.split('\n');
  const sections: SubmissionSection[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (/^\d+\.\s*\S/.test(line) && line.length < 60) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
      }
      currentTitle = line.trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
  }

  return sections.length > 0 ? sections : [{ title: '본문', content: normalized }];
}

const EMPTY_DEFAULTS: SupplementDocumentData = {
  caseName: '',
  caseNo: '',
  claimantName: '',
  claimantPhone: '',
  claimantAddress: '',
  respondent: '',
  documentType: '보충서면',
  submissionContent: [],
  filingDate: '',
  submitterName: '',
  committee: '',
  attachments: [],
};

const SUPPLEMENT_STEPS = [
  { label: '상담 및 진단' },
  { label: '청구서 작성' },
  { label: '답변서 수령' },
  { label: '보충서면 작성' },
  { label: '위원회 심리' },
];

export default function SupplementCompletePage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const methods = useForm<SupplementDocumentData>({ defaultValues: EMPTY_DEFAULTS });
  const documentData = useWatch({ control: methods.control }) as SupplementDocumentData;
  const resetForm = methods.reset;

  useEffect(() => {
    const analysisNo = resolveAnalysisNo();
    if (!analysisNo) return;

    Promise.all([
      apiClient.get<{
        status: string;
        data: { contentJson: { submissionContent: string } };
      }>(`/analysis/${analysisNo}/documents`),
      apiClient.get<{
        status: string;
        data: { evidenceId: number; evidenceType: string; submitted: boolean }[];
      }>(`/analysis/${analysisNo}/evidence`),
    ])
      .then(([docRes, evidenceRes]) => {
        const submissionContent =
          docRes.status === 'SUCCESS' && docRes.data?.contentJson?.submissionContent
            ? parseSubmissionContent(docRes.data.contentJson.submissionContent)
            : [];

        const attachments =
          evidenceRes.status === 'SUCCESS' && Array.isArray(evidenceRes.data)
            ? evidenceRes.data.filter((e) => e.submitted).map((e) => e.evidenceType)
            : [];

        resetForm({ ...EMPTY_DEFAULTS, submissionContent, attachments });
      })
      .catch(() => {});
  }, [resetForm]);

  return (
    <FormProvider {...methods}>
      <div className="flex w-full min-h-screen animate-in fade-in duration-500">
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-6xl px-8 flex flex-col">
            <CompletionHeader
              title="보충서면 작성이 완료되었습니다."
              description="서류를 다운로드하여 제출해주세요."
              steps={SUPPLEMENT_STEPS}
              completedSteps={4}
            />

            <div className="flex flex-col gap-6 mb-8 w-full">
              <SupplementFileDownloadTab documentData={documentData} />
            </div>

            <div className="flex justify-end pb-10">
              <Button
                variant="outline"
                onClick={() => router.push(`/appeal/${caseNo}/ruling/upload`)}
              >
                다음 절차로
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
