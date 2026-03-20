import React from 'react';
import SectionHeader from '../../_components/SectionHeader';
import StrategySummary from './_components/StrategySummary';
import AiJudgment from './_components/AiJudgment';
import DetailAccordion from './_components/DetailAccordion';
import UrgentNotice from './_components/UrgentNotice';
import PrecedentList from './_components/PrecedentList';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_ANALYSIS_DATA, MOCK_EVIDENCE_DATA } from './_mock/mockdata';
import { AppealType, PossibilityType, Reason, Precedent, Evidence } from './types';

// ── mock → 컴포넌트 Props 매핑 ──────────────────────────
const ad = MOCK_ANALYSIS_DATA.data;

// appealPossibility('HIGH') → PossibilityType('h')
const possibilityLookup: Record<string, PossibilityType> = {
  HIGH: 'h',
  MEDIUM: 'm',
  LOW: 'l',
};

// legalIssues → Reason[]
const reasons: Reason[] = ad.legalIssues.map((issue) => ({
  title: issue.title,
  cause: issue.basisText,
  opinion: issue.description,
  lawBasis: issue.lawBasis,
}));

// representativePrecedent → Precedent[]
const precedents: Precedent[] = [
  {
    caseName: ad.representativePrecedent.precedentName,
    point: ad.representativePrecedent.matchReason,
    result: ad.representativePrecedent.result,
  },
];

// evidenceData → Evidence[]
const evidences: Evidence[] = MOCK_EVIDENCE_DATA.data.map((e) => ({
  title: e.evidenceType,
}));

export default function ReportPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center p-4 py-12 md:py-24">
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
        <DetailAccordion reasons={reasons} evidences={evidences} />

        {/* 6. 유사 판례 */}
        <PrecedentList precedents={precedents} />

        {/* 하단 이동 버튼 */}
        <div className="flex justify-end pt-8">
          <Link href="/appeal/claim/suggest">
            <Button>다음 단계로 이동하기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
