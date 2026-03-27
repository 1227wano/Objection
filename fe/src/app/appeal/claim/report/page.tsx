'use client';

import { useState, useEffect } from 'react';
import SectionHeader from '../../_components/SectionHeader';
import StrategySummary from './_components/StrategySummary';
import AiJudgment from '../../_components/AiJudgment';
import DetailAccordion from './_components/DetailAccordion';
import UrgentNotice from './_components/UrgentNotice';
import PrecedentSection from './_components/PrecedentSection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../_components/LoadingSpinner';
import { apiClient } from '@/lib/api-client';
import { AnalysisApiResponse, AnalysisApiData, AppealType, PossibilityType } from './types';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

const possibilityLookup: Record<string, PossibilityType> = {
  H: 'h',
  M: 'm',
  L: 'l',
  HIGH: 'h',
  MEDIUM: 'm',
  LOW: 'l',
};

function resolveAnalysisNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY)
  );
}

export default function ReportPage() {
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
      .catch(() => setError('분석 결과를 불러오지 못했습니다.'))
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
  const possibility = possibilityLookup[precedentResult.appealPossibility] ?? 'l';

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 1. 헤더 */}
        <div className="flex flex-col gap-6">
          <SectionHeader title="본안 판단 결과 보고서" badge={{ text: 'AI 검토 완료' }} />
          {/* 2. 전략 요약 */}
          <StrategySummary
            appealType={precedentResult.claimType as AppealType}
            possibility={possibility}
          />
        </div>

        <div className="w-full h-px bg-gray-100 my-1"></div>

        {/* 3. 긴급 권고 (집행정지 필요 시) */}
        <UrgentNotice stayOfExecution={precedentResult.stayRecommended} />

        {/* 4. AI 판단 요약 */}
        <AiJudgment summation={precedentResult.strategySummary} />

        {/* 5. 상세 아코디언 */}
        <DetailAccordion mainPoints={precedentResult.mainPoints} />

        {/* 6. 유사 판례 */}
        <PrecedentSection precedentInfos={precedentResult.precedentInfos} />

        {/* 하단 이동 버튼 */}
        <div className="flex justify-end pt-8">
          <Button asChild>
            <Link href="/appeal/claim/suggest">다음 단계로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
