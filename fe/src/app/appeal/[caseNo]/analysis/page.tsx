'use client';

import { useParams } from 'next/navigation';
import { useNoticeAnalysis } from './_hooks/useNoticeAnalysis';
import AnalysisSummaryCard from './_components/AnalysisSummaryCard';
import EligibilityCard from './_components/EligibilityCard';
import DdayProgressCard from './_components/DdayProgressCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SectionHeader from '../../_components/SectionHeader';
import LoadingSpinner from '../../_components/LoadingSpinner';
import ErrorFallback from '../../_components/ErrorFallback';

export default function AnalysisPage() {
  const { caseNo } = useParams<{ caseNo: string }>();

  // 1. 커스텀 훅을 통해 데이터 및 상태 관리 (비즈니스 로직 분리)
  const { analysisData, isLoading, isError } = useNoticeAnalysis(caseNo);

  if (isLoading) return <LoadingSpinner />;

  if (isError) return <ErrorFallback />;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <SectionHeader
        title="처분서 분석 결과"
        description={
          <>
            업로드하신 처분서를 기반으로 <span className="text-second font-semibold">행정심판 청구 가능</span> 여부를 자동 분석한 결과입니다.
            <br />
            법적 효력이 있는 전문가 의견이 아님을 유의해 주세요.
          </>
        }
      />

      <div className="grid grid-cols-1">
        {/* 2. 처분서 내용 요약 카드 */}
        <AnalysisSummaryCard summary={analysisData?.summary} details={analysisData?.details} />

        {/* 3. 적격성 판단 카드 */}
        <EligibilityCard eligibility={analysisData?.eligibility} />

        {/* 4. 디데이 진행상황 표시 */}
        <DdayProgressCard deadline={analysisData?.deadline} />
      </div>

      {/* 5. 하단 제어 버튼 */}
      <div className="flex justify-end pt-8">
        <Button asChild>
          <Link href={`/appeal/${caseNo}/claim/incident`}>다음 단계로</Link>
        </Button>
      </div>
    </div>
  );
}
