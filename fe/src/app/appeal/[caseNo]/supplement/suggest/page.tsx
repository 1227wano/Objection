'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SectionHeader from '../../../_components/SectionHeader';
import ChecklistGroup from '../../../_components/ChecklistGroup';
import RightSidebar from './_components/RightSidebar';
import ConfirmModal from '../../claim/suggest/_components/ConfirmModal';
import GenerationLoadingPage from '../../claim/suggest/_components/GenerationLoadingPage';
import { Button } from '@/components/ui/button';
import { useEvidence } from '../../claim/suggest/_hook/useEvidence';
import { apiClient } from '@/lib/api-client';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveAnalysisNo(): number {
  if (typeof window === 'undefined') return 0;
  const val =
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY);
  return val ? Number(val) : 0;
}

type PageStep = 'suggest' | 'loading';

async function createDocument(params: { analysisNo: number; documentType: string }) {
  return apiClient.post(`/analysis/${params.analysisNo}/documents`, {
    documentType: params.documentType,
    userInput: null,
  });
}

export default function SupplementSuggestPage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const analysisNo = resolveAnalysisNo();
  const { evidences, isLoading, updateEvidences } = useEvidence(analysisNo);

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
        documentType: 'SUPPLEMENT_STATEMENT',
      }),
    );
    setShowModal(false);
    setPageStep('loading');
  };

  const handleGenerationComplete = () => {
    router.push(`/appeal/${caseNo}/supplement/write`);
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

  const checkedItems = evidences
    .filter((e) => selectedChecklists.includes(e.evidenceId))
    .map((e) => ({ id: String(e.evidenceId), label: e.evidenceType }));

  return (
    <>
      <div className="flex w-full min-h-screen animate-in fade-in duration-500">
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-4xl px-8 flex flex-col gap-8">
            <SectionHeader
              title="준비해야 할 입증 서류 체크리스트"
              description="답변서 분석 및 보충 경위를 바탕으로 추천된 서류를 확인해 주세요."
            />

            <ChecklistGroup items={evidences} onChange={setSelectedChecklists} hideHeader />

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextClick}>다음 단계로</Button>
            </div>
          </div>
        </div>

        <RightSidebar />
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
