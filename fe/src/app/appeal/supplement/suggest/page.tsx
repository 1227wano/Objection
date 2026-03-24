'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeader from '../../_components/SectionHeader';
import ChecklistGroup from '../../claim/suggest/_components/ChecklistGroup';
import RightSidebar from './_components/RightSidebar';
import { Button } from '@/components/ui/button';
import { MOCK_SUPPLEMENT_EVIDENCE } from './_mock/mockdata';

const evidenceData = MOCK_SUPPLEMENT_EVIDENCE.data;

export default function SupplementSuggestPage() {
  const router = useRouter();
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>(
    evidenceData.filter((item) => item.submitted).map((item) => item.evidenceId),
  );

  const handleNextClick = () => {
    console.log('선택된 체크리스트 ID:', selectedChecklists);
    router.push('/appeal/supplement/write');
  };

  return (
    <div className="flex w-full min-h-screen animate-in fade-in duration-500">
      <div className="flex-1 flex justify-center py-12 md:py-16">
        <div className="w-full max-w-4xl px-8 flex flex-col gap-8">
          <SectionHeader
            title="준비해야 할 입증 서류 체크리스트"
            description="답변서 분석 및 보충 경위를 바탕으로 추천된 서류를 확인해 주세요."
          />

          <ChecklistGroup items={evidenceData} onChange={setSelectedChecklists} hideHeader />

          <div className="flex justify-end pt-4">
            <Button onClick={handleNextClick}>다음 단계로</Button>
          </div>
        </div>
      </div>

      <RightSidebar />
    </div>
  );
}
