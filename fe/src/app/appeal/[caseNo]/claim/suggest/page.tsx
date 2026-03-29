'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SectionHeader from '../../../_components/SectionHeader';
import SelectionGroup from './_components/SelectionGroup';
import ChecklistGroup from '../../../_components/ChecklistGroup';
import RightSidebar from './_components/RightSidebar';
import ConfirmModal from './_components/ConfirmModal';
import GenerationLoadingPage from './_components/GenerationLoadingPage';
import { Button } from '@/components/ui/button';
import { AppealType, AnalysisApiResponse, PrecedentResult } from '../report/types';
import { useEvidence } from './_hook/useEvidence';
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

export default function SuggestPage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const analysisNo = resolveAnalysisNo();
  const { evidences, isLoading: isEvidenceLoading, updateEvidences } = useEvidence(analysisNo);

  const [analysisData, setAnalysisData] = useState<PrecedentResult | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AppealType | null>(null);
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>([]);
  const [pageStep, setPageStep] = useState<PageStep>('suggest');
  const [showModal, setShowModal] = useState(false);
  const [documentPromise, setDocumentPromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    if (!analysisNo) return;
    apiClient
      .get<AnalysisApiResponse>(`/analysis/${analysisNo}`)
      .then((res) => {
        if (res.status === 'SUCCESS' && res.data?.precedentResult) {
          setAnalysisData(res.data.precedentResult);
          setSelectedType(res.data.precedentResult.claimType as AppealType);
        }
      })
      .catch(console.error)
      .finally(() => setIsAnalysisLoading(false));
  }, [analysisNo]);

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
    router.push(`/appeal/${caseNo}/claim/write`);
  };

  const handleGenerationError = (error: Error) => {
    console.error('문서 생성 오류:', error);
    alert('문서 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    setPageStep('suggest');
  };

  if (isEvidenceLoading || isAnalysisLoading) {
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
            <SectionHeader title="AI 사안 및 법리 검토" description="심판 유형 분석 및 추천 결과" />

            {analysisData && selectedType && (
              <SelectionGroup
                recommended={analysisData.claimType as AppealType}
                onSelect={setSelectedType}
              />
            )}

            <div className="w-full h-px bg-gray-100" />

            <ChecklistGroup items={evidences} onChange={setSelectedChecklists} />

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextClick}>다음 단계로</Button>
            </div>
          </div>
        </div>

        {analysisData && <RightSidebar data={analysisData} />}
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
