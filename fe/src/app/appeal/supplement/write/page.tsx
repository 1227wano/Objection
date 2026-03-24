'use client';

import { useForm, FormProvider } from 'react-hook-form';
import SectionHeader from '../../_components/SectionHeader';
import { Button } from '@/components/ui/button';
import SupplementEditor from './_components/SupplementEditor';
import RightSidebar from './_components/RightSidebar';
import { MOCK_SUPPLEMENT_DOC } from './_mock/mockDocumentData';
import { SupplementDocumentData } from './_types/document';

export default function SupplementWritePage() {
  const methods = useForm<SupplementDocumentData>({
    defaultValues: MOCK_SUPPLEMENT_DOC,
  });

  const onSubmit = (data: SupplementDocumentData) => {
    console.log('보충서면 제출 데이터:', data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex w-full min-h-screen animate-in fade-in duration-500"
      >
        <div className="flex-1 flex justify-center py-12 md:py-16">
          <div className="w-full max-w-4xl px-8 flex flex-col">
            <SectionHeader
              title="보충서면 초안이 완성되었습니다."
              description="제출 전 내용을 꼼꼼히 확인하고, 수정이 필요한 부분을 직접 편집해 주세요."
            />
            <div className="mt-8">
              <SupplementEditor />
            </div>
            <div className="flex justify-end pt-10 pb-10">
              <Button type="submit">수정 완료</Button>
            </div>
          </div>
        </div>
        <RightSidebar />
      </form>
    </FormProvider>
  );
}
