'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeader from '../../_components/SectionHeader';
import SelectionGroup from './_components/SelectionGroup';
import ChecklistGroup from '../../_components/ChecklistGroup';
import RightSidebar from './_components/RightSidebar';
import { Button } from '@/components/ui/button';
import { MOCK_ANALYSIS_DATA } from '../report/_mock/mockdata';
import { AppealType } from '../report/types';
import { useEvidence } from './_hook/useEvidence';

const analysisData = MOCK_ANALYSIS_DATA.data;

export default function SuggestPage() {
  const router = useRouter();
  const analysisNo = 1;
  const { evidences, isLoading, isError, updateEvidences } = useEvidence(analysisNo);

  const [selectedType, setSelectedType] = useState<AppealType>(
    analysisData.claimType as AppealType,
  );

  // 현재 체크된 항목의 ID 배열
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>([]);

  const handleNextClick = async () => {
    // 기존 서버 데이터(evidences)와 현재 체크된 상태(selectedChecklists)를 비교하여 변경된 항목만 추출
    const pendingChanges: Record<number, boolean> = {};

    evidences.forEach((evidence) => {
      const isNowChecked = selectedChecklists.includes(evidence.evidenceId);
      if (evidence.submitted !== isNowChecked) {
        pendingChanges[evidence.evidenceId] = isNowChecked;
      }
    });

    const isSuccess = await updateEvidences(pendingChanges);

    if (isSuccess) {
      // 다음 단계로 이동하는 로직을 이곳에 작성합니다.
      router.push('/appeal/claim/write');
    } else {
      alert('데이터 저장 중 문제가 발생했습니다.');
    }
  };

  // 데이터를 불러오는 동안 보여줄 화면
  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen animate-in fade-in duration-500">
      {/* ── MainContent (중앙) ── */}
      <div className="flex-1 flex justify-center py-12 md:py-16">
        <div className="w-full max-w-4xl px-8 flex flex-col gap-8">
          <SectionHeader title="AI 사안 및 법리 검토" description="심판 유형 분석 및 추천 결과" />

          <SelectionGroup
            recommended={analysisData.claimType as AppealType}
            onSelect={setSelectedType}
          />

          <div className="w-full h-px bg-gray-100" />

          {/* 실제 API 데이터 연동 */}
          <ChecklistGroup items={evidences} onChange={setSelectedChecklists} />

          <div className="flex justify-end pt-4">
            <Button onClick={handleNextClick}>다음 단계로</Button>
          </div>
        </div>
      </div>

      {/* ── RightSidebar (우측) ── */}
      <RightSidebar data={analysisData} />
    </div>
  );
}
