'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import SectionHeader from '../../../_components/SectionHeader';
import { Button } from '@/components/ui/button';
import SupplementEditor from './_components/SupplementEditor';
import RightSidebar from './_components/RightSidebar';
import { SupplementDocumentData, SubmissionSection } from './_types/document';
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
  // \\n(이스케이프 문자열)과 실제 \n 둘 다 처리
  const normalized = text.replace(/\\n/g, '\n');
  const lines = normalized.split('\n');
  const sections: SubmissionSection[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    // "1. " 또는 "1." 으로 시작하는 줄을 섹션 제목으로 인식 (너무 긴 줄은 본문으로 처리)
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

export default function SupplementWritePage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const methods = useForm<SupplementDocumentData>({ defaultValues: EMPTY_DEFAULTS });
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
        const rawContent = docRes.data?.contentJson?.submissionContent;
        const submissionContent =
          docRes.status === 'SUCCESS' && rawContent
            ? parseSubmissionContent(rawContent)
            : EMPTY_DEFAULTS.submissionContent;

        const attachments =
          evidenceRes.status === 'SUCCESS' && Array.isArray(evidenceRes.data)
            ? evidenceRes.data.filter((e) => e.submitted).map((e) => e.evidenceType)
            : [];

        resetForm({ ...EMPTY_DEFAULTS, submissionContent, attachments });
      })
      .catch(() => {});
  }, [resetForm]);

  const onSubmit = async (data: SupplementDocumentData) => {
    const analysisNo = resolveAnalysisNo();
    if (!analysisNo) return;

    const submissionText = data.submissionContent
      .map((s) => `${s.title}\n${s.content}`)
      .join('\n\n');

    try {
      await apiClient.patch(`/analysis/${analysisNo}/documents`, {
        documentType: 'SUPPLEMENT_STATEMENT',
        contentJson: { submissionContent: submissionText },
      });
      router.push(`/appeal/${caseNo}/supplement/complete`);
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex w-full min-h-screen animate-in fade-in duration-500"
      >
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-4xl px-8 flex flex-col">
            <SectionHeader
              title="보충서면 초안이 완성되었습니다."
              description="제출 전 내용을 꼼꼼히 확인하고, 수정이 필요한 부분을 직접 편집해 주세요."
            />
            <div className="mt-8">
              <SupplementEditor />
            </div>
            <div className="flex justify-end pt-10 pb-10">
              <Button type="submit">수정 완료</Button>
            </div>
          </div>
        </div>
        <RightSidebar />
      </form>
    </FormProvider>
  );
}
