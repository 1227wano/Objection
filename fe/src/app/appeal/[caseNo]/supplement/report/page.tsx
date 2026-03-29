'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SectionHeader from '../../../_components/SectionHeader';
import AiJudgment from '../../../_components/AiJudgment';
import DetailAccordion from './_components/DetailAccordion';
import PrecedentList from './_components/PrecedentList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../../_components/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { AnalysisApiResponse, AnalysisApiData, PrecedentInfo } from '../../claim/report/types';
import { Precedent } from './types';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveAnalysisNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY)
  );
}

export default function SupplementReportPage() {
  const { caseNo } = useParams<{ caseNo: string }>();
  const [data, setData] = useState<AnalysisApiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analysisNo = resolveAnalysisNo();
    if (!analysisNo) {
      setError('분석 번호를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    apiClient
      .get<AnalysisApiResponse>(`/analysis/${analysisNo}`)
      .then((res) => setData(res.data))
      .catch(() => setError('보충서면 전략 분석 결과를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center text-gray-500">
        {error}
      </div>
    );
  }

  const { precedentResult } = data;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 1. 헤더 */}
        <SectionHeader title="보충서면 전략 보고서" badge={{ text: 'AI 분석 완료' }} />

        {/* 2. AI 전략 */}
        <AiJudgment label="보충서면 대응 전략" summation={precedentResult.strategySummary} />

        {/* 3. 상세 아코디언 */}
        <DetailAccordion mainPoints={precedentResult.mainPoints} />

        {/* 하단 이동 버튼 */}
        <div className="flex justify-end pt-8">
          <Button asChild>
            <Link href={`/appeal/${caseNo}/supplement/suggest`}>다음 단계로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
