'use client';

import SectionHeader from '../../_components/SectionHeader';
import SelectionGroup from './_components/SelectionGroup';
import ChecklistGroup from './_components/ChecklistGroup';
import AISummaryCard from './_components/AISummaryCard';
import CaseAccordion from './_components/CaseAccordion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MOCK_ANALYSIS_DATA, MOCK_EVIDENCE_DATA } from '../report/_mock/mockdata';

// 데이터 참조 편의를 위한 별칭
const analysisData = MOCK_ANALYSIS_DATA.data;
const evidenceData = MOCK_EVIDENCE_DATA.data;

export default function SuggestPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8 p-4 py-12 md:py-16">

      {/* ── MainContent (중앙) ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        <SectionHeader
          title="AI 사안 및 법리 검토"
          description="심판 유형 분석 및 추천 결과"
        />

        {/* SelectionGroup: claimType을 recommended로 전달 */}
        <SelectionGroup recommended={analysisData.claimType} />

        {/* 구분선 */}
        <div className="w-full h-px bg-gray-100" />

        {/* ChecklistGroup: evidenceData 매핑 */}
        <ChecklistGroup items={evidenceData} />

        {/* NavigationAction */}
        <div className="flex justify-center pt-4">
          <Link href="#">
            <Button>다음 단계로 이동하기</Button>
          </Link>
        </div>
      </div>

      {/* ── RightSidebar (우측) ── */}
      <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
        {/* AISummaryCard: analysisData 전체를 전달 */}
        <AISummaryCard data={analysisData} />
        {/* CaseAccordion: representativePrecedent 매핑 */}
        <CaseAccordion precedent={analysisData.representativePrecedent} />
      </aside>

    </div>
  );
}
