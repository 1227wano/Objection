'use client';

import { useForm, FormProvider } from 'react-hook-form';
import SectionHeader from '../../_components/SectionHeader';
import { Button } from '@/components/ui/button';
import DocumentEditor from './_components/DocumentEditor';
import RightSidebar from './_components/RightSidebar';
import { MOCK_DOCUMENT_DATA, MOCK_LEGAL_ISSUES } from './_mock/mockDocumentData';
import { DocumentData } from './_types/document';

export default function WritePage() {
  const methods = useForm<DocumentData>({
    defaultValues: MOCK_DOCUMENT_DATA,
  });

  const onSubmit = (data: DocumentData) => {
    console.log('폼 제출 데이터:', data);
  };
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex w-full min-h-screen bg-mainbgcolor animate-in fade-in duration-500"
      >
        {/* 중앙 편집기 영역 */}
        <div className="flex-1 flex justify-center py-10">
          <div className="w-full max-w-4xl px-8 flex flex-col">
            <SectionHeader
              title="행정심판 청구서 초안이 완성되었습니다."
              description="제출 전 사실관계가 맞는지 꼼꼼히 확인하고, 수정이 필요한 부분을 직접 편집해 주세요"
            />

            <div className="mt-8">
              <DocumentEditor />
            </div>

            {/* 수정 완료 버튼 */}
            <div className="flex justify-end pt-10 pb-10">
              <Button type="submit">수정 완료</Button>
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드바 */}
        <RightSidebar legalIssues={MOCK_LEGAL_ISSUES} />
      </form>
    </FormProvider>
  );
}
