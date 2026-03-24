import React from 'react';
import SectionHeader from '../../_components/SectionHeader';
import AiJudgment from '../../claim/report/_components/AiJudgment';
import RespondentSummary from './_components/RespondentSummary';
import MainPointCard from './_components/MainPointCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_REBUTTAL_DATA } from './_mock/mockdata';

const rd = MOCK_REBUTTAL_DATA.data;

export default function RebuttalAnalysisPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 헤더 */}
        <SectionHeader title="답변서 분석 결과" badge={{ text: 'AI 분석 완료' }} />

        {/* 섹션 1: 답변서 요약 (회색 왼쪽보더 - 피청구인 주장) */}
        <RespondentSummary summary={rd.respondentSummary} />

        <div className="w-full h-px bg-gray-100 my-1" />

        {/* 섹션 2: 보충서면 대응 전략 (콜아웃 카드 - AI 분석) */}
        <div className="flex flex-col gap-6">
          <AiJudgment label="보충서면 대응 전략" summation={rd.strategySummary} />
          <div className="my-1" />
          <MainPointCard points={rd.mainPoints} />
        </div>

        {/* 하단 CTA */}
        <div className="flex items-center justify-end pt-8">
          <Button asChild>
            <Link href="/appeal/supplement/case">다음 단계로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
