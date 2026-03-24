'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import StepProgress from '../../claim/complete/_components/StepProgress';
import CompletionHeader from '../../claim/complete/_components/CompletionHeader';
import FileDownloadTab from '../../claim/complete/_components/FileDownloadTab';
import SupplementPortalCopyTab from './_components/SupplementPortalCopyTab';
import { MOCK_SUPPLEMENT_DOC } from '../write/_mock/mockDocumentData';
import { SupplementDocumentData } from '../write/_types/document';

const SUPPLEMENT_STEPS = [
  { label: '상담 및 진단' },
  { label: '청구서 작성' },
  { label: '답변서 수령' },
  { label: '보충서면 작성' },
  { label: '위원회 심리' },
];

export default function SupplementCompletePage() {
  const router = useRouter();
  const methods = useForm<SupplementDocumentData>({ defaultValues: MOCK_SUPPLEMENT_DOC });

  return (
    <FormProvider {...methods}>
      <div className="flex w-full min-h-screen animate-in fade-in duration-500">
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-6xl px-8 flex flex-col">
            <StepProgress steps={SUPPLEMENT_STEPS} completedSteps={4} />

            <CompletionHeader
              title="보충서면 작성이 완료되었습니다."
              description="아래 두 가지 방법 중 편하신 방식을 선택하여 제출을 진행해 주세요."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    온라인 포털 직접 입력 (텍스트 복사)
                  </h2>
                  <p className="text-base text-gray-500">
                    온라인 행정심판 포털에 접속하여 아래 내용을 각 항목에 복사해 넣으세요.
                  </p>
                </div>
                <SupplementPortalCopyTab data={methods.watch()} />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    서면 제출 및 첨부파일용 (다운로드)
                  </h2>
                  <p className="text-base text-gray-500">
                    온라인 제출 시 첨부파일로 활용하거나, 인쇄하여 등기 우편으로 제출하실 수
                    있습니다.
                  </p>
                </div>
                <FileDownloadTab />
              </div>
            </div>

            <div className="flex justify-end pb-10">
              <Button variant="outline" onClick={() => router.push('/appeal/ruling/upload')}>
                다음 절차로
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
