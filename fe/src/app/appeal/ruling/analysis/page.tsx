'use client';

import { useState, useEffect } from 'react';
import SectionHeader from '../../_components/SectionHeader';
import AiJudgment from '../../_components/AiJudgment';
import NextStepCards from './_components/NextStepCards';
import LoadingSpinner from '../../_components/LoadingSpinner';
import { apiClient } from '@/lib/api-client';

const CURRENT_CASE_KEY = 'currentCaseNo';
const CURRENT_DECISION_DOC_KEY = 'currentDecisionGovDocNo';

interface GovDocumentResponse {
  status: string;
  message: string;
  data: {
    summary: string | null;
  };
}

export default function RulingAnalysisPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const caseNo =
      window.sessionStorage.getItem(CURRENT_CASE_KEY) ||
      window.localStorage.getItem(CURRENT_CASE_KEY);
    const govDocNo =
      window.sessionStorage.getItem(CURRENT_DECISION_DOC_KEY) ||
      window.localStorage.getItem(CURRENT_DECISION_DOC_KEY);

    if (!caseNo || !govDocNo) {
      setError('사건 번호 또는 문서 번호를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    apiClient
      .get<GovDocumentResponse>(`/cases/${caseNo}/gov-documents/${govDocNo}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => setError('재결서 분석 결과를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || summary === null) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 헤더 */}
        <SectionHeader
          title="재결서 분석 완료!"
          description="AI가 분석한 재결서의 핵심 내용을 확인해보세요."
          descriptionColor="text-blue-600"
        />

        {/* 재관 요지 */}
        <AiJudgment label="재관 요지" summation={summary} />

        {/* 결과 수용 / 결과 불복 */}
        <NextStepCards />
      </div>
    </div>
  );
}
