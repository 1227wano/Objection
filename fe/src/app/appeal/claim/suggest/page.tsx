'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeader from '../../_components/SectionHeader';
import SelectionGroup from './_components/SelectionGroup';
import ChecklistGroup from './_components/ChecklistGroup';
import RightSidebar from './_components/RightSidebar';
import { Button } from '@/components/ui/button';
import { MOCK_ANALYSIS_DATA, MOCK_EVIDENCE_DATA } from '../report/_mock/mockdata';
import { AppealType } from '../report/types';

const analysisData = MOCK_ANALYSIS_DATA.data;
const evidenceData = MOCK_EVIDENCE_DATA.data;

export default function SuggestPage() {
  const router = useRouter();

  // 선택된 상태 관리를 위한 State
  const [selectedType, setSelectedType] = useState<AppealType>(
    analysisData.claimType as AppealType,
  );
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>(
    evidenceData.filter((item) => item.submitted).map((item) => item.evidenceId),
  );

  // 버튼 클릭 핸들러
  const handleNextClick = () => {
    console.log('선택된 심판 종류:', selectedType);
    console.log('선택된 체크리스트 ID 배열:', selectedChecklists);

    //router.push('/appeal/claim/document');
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl p-4 py-12 md:py-16 animate-in fade-in duration-500">
      {/* ── MainContent (중앙) ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-8 px-8">
        <SectionHeader title="AI 사안 및 법리 검토" description="심판 유형 분석 및 추천 결과" />

        <SelectionGroup
          recommended={analysisData.claimType as AppealType}
          onSelect={setSelectedType}
        />

        <div className="w-full h-px bg-gray-100" />

        <ChecklistGroup items={evidenceData} onChange={setSelectedChecklists} />

        {/* NavigationAction (우측 정렬로 수정: justify-end) */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleNextClick}>다음 단계로 이동하기</Button>
        </div>
      </div>

      {/* ── RightSidebar (우측) ── */}
      <RightSidebar data={analysisData} />
    </div>
  );
}
