'use client';

import { useNoticeAnalysis } from './_hooks/useNoticeAnalysis';
import AnalysisSummaryCard from './_components/AnalysisSummaryCard';
import EligibilityCard from './_components/EligibilityCard';
import DdayProgressCard from './_components/DdayProgressCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AnalysisPage() {
  // 1. 커스텀 훅을 통해 데이터 및 상태 관리 (비즈니스 로직 분리)
  const { analysisData, isLoading, isError } = useNoticeAnalysis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B1965]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 font-semibold mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#1B1965] text-white rounded-lg"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col p-4 py-12 md:py-16">
      {/* 헤더 영역: 제목 */}
      <div className="mb-12 pb-8 border-b border-gray-200">
        <h1 className="text-[28px] md:text-[34px] font-extrabold text-[var(--color-mainbgcolor, #111827)] leading-[1.35] tracking-tight mb-3">
          처분서 분석을 통해서
          <br />
          <span className="text-second">행정심판 청구 가능</span> 여부를 판단한 결과입니다.
        </h1>
        <p className="text-[13px] text-gray-400 font-medium tracking-wide">
          아래 내용은 업로드하신 처분서를 기반으로 자동 분석된 결과입니다. 법적 효력이 있는 전문가
          의견이 아님을 유의해주세요.
        </p>
      </div>

      <div className="grid grid-cols-1">
        {/* 2. 처분서 내용 요약 카드 */}
        <AnalysisSummaryCard summary={analysisData?.summary} details={analysisData?.details} />

        {/* 3. 적격성 판단 카드 */}
        <EligibilityCard eligibility={analysisData?.eligibility} />

        {/* 4. 디데이 진행상황 표시 */}
        <DdayProgressCard deadline={analysisData?.deadline} />
      </div>

      {/* 5. 하단 제어 버튼 */}
      <div className="pt-2 flex justify-end">
        <Button
          asChild
          className="rounded-full px-10 shadow-sm tracking-wide bg-[#161453] hover:bg-[#121045]"
        >
          <Link href="/appeal/claim/incident">계속진행</Link>
        </Button>
      </div>
    </div>
  );
}
