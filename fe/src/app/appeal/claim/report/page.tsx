import SectionHeader from '../../_components/SectionHeader';
import StrategySummary from './_components/StrategySummary';
import AiJudgment from '../../_components/AiJudgment';
import DetailAccordion from './_components/DetailAccordion';
import UrgentNotice from './_components/UrgentNotice';
import PrecedentSection from './_components/PrecedentSection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_ANALYSIS_DATA } from './_mock/mockdata';
import { AppealType, PossibilityType } from './types';

// ── mock → 컴포넌트 Props 매핑 ──────────────────────────
const ad = MOCK_ANALYSIS_DATA.data;

// appealPossibility('HIGH') → PossibilityType('h')
const possibilityLookup: Record<string, PossibilityType> = {
  HIGH: 'h',
  MEDIUM: 'm',
  LOW: 'l',
};

export default function ReportPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        {/* 1. 헤더 */}
        <div className="flex flex-col gap-6">
          <SectionHeader title="본안 판단 결과 보고서" badge={{ text: 'AI 검토 완료' }} />
          {/* 2. 전략 요약 */}
          <StrategySummary
            appealType={ad.claimType as AppealType}
            possibility={possibilityLookup[ad.appealPossibility] ?? 'h'}
          />
        </div>

        <div className="w-full h-px bg-gray-100 my-1"></div>

        {/* 3. 긴급 권고 (집행정지 필요 시) */}
        <UrgentNotice stayOfExecution={true} />

        {/* 4. AI 판단 요약 */}
        <AiJudgment summation={ad.strategySummary} />

        {/* 5. 상세 아코디언 */}
        <DetailAccordion mainPoints={ad.mainPoints} />

        {/* 6. 유사 판례 */}
        <PrecedentSection />

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
