import SectionHeader from '../../_components/SectionHeader';
import AiJudgment from '../../_components/AiJudgment';
import DetailAccordion from './_components/DetailAccordion';
import PrecedentList from './_components/PrecedentList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_SUPPLEMENT_ANALYSIS_DATA } from './_mock/mockdata';
import { Precedent } from './types';

const ad = MOCK_SUPPLEMENT_ANALYSIS_DATA.data;

// representativePrecedent → Precedent[]
const precedents: Precedent[] = [
  {
    caseName: ad.representativePrecedent.precedentName,
    point: ad.representativePrecedent.matchReason,
    result: ad.representativePrecedent.result,
  },
];

export default function SupplementReportPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 1. 헤더 */}
        <SectionHeader title="보충서면 전략 보고서" badge={{ text: 'AI 분석 완료' }} />

        {/* 2. AI 전략 */}
        <AiJudgment label="보충서면 대응 전략" summation={ad.strategySummary} />

        {/* 3. 상세 아코디언 */}
        <DetailAccordion mainPoints={ad.mainPoints} />

        {/* 하단 이동 버튼 */}
        <div className="flex justify-end pt-8">
          <Button asChild>
            <Link href="/appeal/supplement/suggest">다음 단계로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
