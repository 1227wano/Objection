import SectionHeader from '../../_components/SectionHeader';
import RespondentSummary from './_components/RespondentSummary';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_REBUTTAL_DATA } from './_mock/mockdata';

const rd = MOCK_REBUTTAL_DATA.data;

export default function RebuttalAnalysisPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 헤더 */}
        <SectionHeader title="답변서 요약 결과" />

        {/* 섹션: 답변서 요약 (피청구인 주장) */}
        <RespondentSummary summary={rd.respondentSummary} />

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
