'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CompletionHeader from './_components/CompletionHeader';
import PortalCopyTab from './_components/PortalCopyTab';
import FileDownloadTab from './_components/FileDownloadTab';
import { useDocumentStore } from './../_store/useDocumentStore';

export default function ClaimCompletePage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const store = useDocumentStore();

  // store가 비어있으면 write로 리다이렉트 (직접 URL 접근 방어)
  useEffect(() => {
    if (!store.hasData()) {
      router.replace(`/appeal/${caseNo}/claim/write`);
    }
  }, [store, router]);

  const handleNext = () => {
    router.push(`/appeal/${caseNo}/answer/upload`);
  };

  if (!store.contentJson) return null;

  const documentData = {
    contentJson: store.contentJson,
    personalInfo: store.personalInfo,
    representative: store.representative,
    respondent: store.respondent,
    appealCommittee: store.appealCommittee,
    dispositionKnownDate: store.dispositionKnownDate,
    evidenceList: store.evidenceList,
    grievanceNotified: store.grievanceNotified,
    publicDefenderRequest: store.publicDefenderRequest,
    oralHearingRequest: store.oralHearingRequest,
    filingDate: store.filingDate,
  };

  return (
    <div className="flex w-full min-h-screen animate-in fade-in duration-500">
      <div className="flex-1 flex justify-center py-12 md:py-16">
        <div className="w-full max-w-6xl px-8 flex flex-col">
          {/* 완료 헤더 (StepProgress 포함) */}
          <CompletionHeader />

          {/* 제출 방법 카드 2열 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            {/* 왼쪽: 온라인 포털 직접 입력 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">
                  온라인 포털 직접 입력 (텍스트 복사)
                </h2>
                <p className="text-base text-gray-500">
                  온라인 행정심판 포털에 접속하여 아래 내용을 각 항목에 복사해 넣으세요.
                </p>
              </div>
              <PortalCopyTab
                dispositionContent={store.contentJson.dispositionContent}
                claimPurpose={store.contentJson.claimPurpose}
                claimReason={store.contentJson.claimReason}
              />
            </div>

            {/* 오른쪽: 서면 제출 및 첨부파일용 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">
                  서면 제출 및 첨부파일용 (다운로드)
                </h2>
                <p className="text-base text-gray-500">
                  온라인 제출 시 첨부파일로 활용하거나, 인쇄하여 등기 우편으로 제출하실 수 있습니다.
                </p>
              </div>
              <FileDownloadTab documentData={documentData} />
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="flex justify-end pb-10">
            <Button variant="outline" onClick={handleNext}>
              다음 절차로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
