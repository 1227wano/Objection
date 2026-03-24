'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import StepProgress from './_components/StepProgress';
import CompletionHeader from './_components/CompletionHeader';
import ExecutionStopBanner from './_components/ExecutionStopBanner';
import PortalCopyTab from './_components/PortalCopyTab';
import FileDownloadTab from './_components/FileDownloadTab';
import { MOCK_DOCUMENT_DATA } from '../write/_mock/mockDocumentData';
import { DocumentData } from '../write/_types/document';

export default function ClaimCompletePage() {
  const router = useRouter();
  const methods = useForm<DocumentData>({ defaultValues: MOCK_DOCUMENT_DATA });

  return (
    <FormProvider {...methods}>
      <div className="flex w-full min-h-screen animate-in fade-in duration-500">
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-6xl px-8 flex flex-col">
            {/* 스텝 진행 인디케이터 */}
            <StepProgress />

            {/* 완료 헤더 */}
            <CompletionHeader />

            {/* 제출 방법 카드 2열 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              {/* 왼쪽 카드: 온라인 포털 직접 입력 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    온라인 포털 직접 입력 (텍스트 복사)
                  </h2>
                  <p className="text-base text-gray-500">
                    온라인 행정심판 포털에 접속하여 아래 내용을 각 항목에 복사해 넣으세요.
                  </p>
                </div>
                <PortalCopyTab data={methods.watch()} />
              </div>

              {/* 오른쪽 카드: 서면 제출 및 첨부파일용 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    서면 제출 및 첨부파일용 (다운로드)
                  </h2>
                  <p className="text-base text-gray-500">
                    온라인 제출 시 첨부파일로 활용하거나, 인쇄하여 등기 우편으로 제출하실 수 있습니다.
                  </p>
                </div>
                <FileDownloadTab />
              </div>
            </div>

            {/* 집행정지 긴급 배너 */}
            <ExecutionStopBanner />

            {/* 하단 네비게이션 */}
            <div className="flex justify-end pb-10">
              <Button variant="outline" onClick={() => router.push('/appeal/answer/upload')}>
                다음 절차로
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
