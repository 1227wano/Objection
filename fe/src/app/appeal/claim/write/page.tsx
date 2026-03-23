'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import SectionHeader from '../../_components/SectionHeader';
import { Button } from '@/components/ui/button';
import DocumentEditor from './_components/DocumentEditor';
import PortalCopyTab from './_components/PortalCopyTab';
import FileDownloadTab from './_components/FileDownloadTab';
import RightSidebar from './_components/RightSidebar';
import { MOCK_DOCUMENT_DATA, MOCK_LEGAL_ISSUES } from './_mock/mockDocumentData';
import { DocumentData } from './_types/document';

const TABS = ['청구서 편집기', '온라인 포털 복사', '파일 다운로드'];

export default function WritePage() {
  const [activeTab, setActiveTab] = useState(0);

  const methods = useForm<DocumentData>({
    defaultValues: MOCK_DOCUMENT_DATA,
  });

  const onSubmit = (data: DocumentData) => {
    console.log('폼 제출 데이터:', data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full overflow-hidden animate-in fade-in duration-500">
        {/* 중앙 편집기 영역 */}
        <div className="flex-1 overflow-y-auto bg-mainbgcolor">
          <div className="px-8 py-10">
            <SectionHeader
              title="행정심판 청구서 초안이 완성되었습니다."
              description="제출 전 사실관계가 맞는지 꼼꼼히 확인하고, 수정이 필요한 부분을 직접 편집해 주세요"
            />

            {/* 탭 네비게이션 */}
            <div className="flex border-b border-gray-200 mb-8">
              {TABS.map((tab, idx) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(idx)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === idx
                      ? 'border-b-2 border-first text-first font-bold'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === 0 && <DocumentEditor />}
            {activeTab === 1 && <PortalCopyTab data={methods.watch()} />}
            {activeTab === 2 && <FileDownloadTab />}

            {/* 수정 완료 버튼 */}
            <div className="flex justify-end mt-10 pb-10">
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
