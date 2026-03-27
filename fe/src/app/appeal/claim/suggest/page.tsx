'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeader from '../../_components/SectionHeader';
import SelectionGroup from './_components/SelectionGroup';
import ChecklistGroup from '../../_components/ChecklistGroup';
import RightSidebar from './_components/RightSidebar';
import ConfirmModal from './_components/ConfirmModal';
import GenerationLoadingPage from './_components/GenerationLoadingPage';
import { Button } from '@/components/ui/button';
import { MOCK_ANALYSIS_DATA } from '../report/_mock/mockdata';
import { AppealType } from '../report/types';
import { useEvidence } from './_hook/useEvidence';
import { apiClient } from '@/lib/api-client';

const analysisData = MOCK_ANALYSIS_DATA.data;

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveAnalysisNo(): number {
  if (typeof window === 'undefined') return 0;
  const val =
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY);
  return val ? Number(val) : 0;
}

type PageStep = 'suggest' | 'loading';

async function createDocument(params: {
  analysisNo: number;
  documentType: string;
  userInput?: string;
}) {
  return apiClient.post(`/analysis/${params.analysisNo}/documents`, {
    documentType: params.documentType,
    userInput: params.userInput ?? null,
  });
}

export default function SuggestPage() {
  const router = useRouter();
  const analysisNo = resolveAnalysisNo();
  const { evidences, isLoading, isError, updateEvidences } = useEvidence(analysisNo);

  const [selectedType, setSelectedType] = useState<AppealType>(
    analysisData.claimType as AppealType,
  );
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>([]);
  const [pageStep, setPageStep] = useState<PageStep>('suggest');
  const [showModal, setShowModal] = useState(false);
  const [documentPromise, setDocumentPromise] = useState<Promise<any> | null>(null);

  const handleNextClick = async () => {
    const pendingChanges: Record<number, boolean> = {};

    evidences.forEach((evidence) => {
      const isNowChecked = selectedChecklists.includes(evidence.evidenceId);
      if (evidence.submitted !== isNowChecked) {
        pendingChanges[evidence.evidenceId] = isNowChecked;
      }
    });

    const isSuccess = await updateEvidences(pendingChanges);

    if (isSuccess) {
      setShowModal(true);
    } else {
      alert('데이터 저장 중 문제가 발생했습니다.');
    }
  };

  const handleConfirmGeneration = () => {
    setDocumentPromise(
      createDocument({
        analysisNo,
        documentType: 'APPEAL_CLAIM',
      }),
    );
    setShowModal(false);
    setPageStep('loading');
  };

  const handleGenerationComplete = () => {
    router.push('/appeal/claim/write');
  };

  const handleGenerationError = (error: Error) => {
    console.error('문서 생성 오류:', error);
    alert('문서 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    setPageStep('suggest');
  };

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  if (pageStep === 'loading') {
    return (
      <GenerationLoadingPage
        documentPromise={documentPromise}
        onComplete={handleGenerationComplete}
        onError={handleGenerationError}
      />
    );
  }

  // 체크된 증거 항목 (모달에 전달)
  const checkedItems = evidences
    .filter((e) => selectedChecklists.includes(e.evidenceId))
    .map((e) => ({ id: String(e.evidenceId), label: e.evidenceType }));

  return (
    <>
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

            <ChecklistGroup items={evidences} onChange={setSelectedChecklists} />

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextClick}>다음 단계로</Button>
            </div>
          </div>
        </div>

        {/* ── RightSidebar (우측) ── */}
        <RightSidebar data={analysisData} />
      </div>

      {showModal && (
        <ConfirmModal
          checkedItems={checkedItems}
          onBack={() => setShowModal(false)}
          onConfirm={handleConfirmGeneration}
        />
      )}
    </>
  );
}
