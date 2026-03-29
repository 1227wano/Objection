'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { ContentJson, PersonalInfo, RepresentativeInfo } from '../../_store/useDocumentStore';

interface DocumentData {
  contentJson: ContentJson;
  personalInfo: PersonalInfo | null;
  representative: RepresentativeInfo | null;
  respondent: string;
  appealCommittee: string;
  dispositionKnownDate: string;
  evidenceList: string[];
  grievanceNotified: boolean;
  publicDefenderRequest: boolean;
  oralHearingRequest: boolean;
  filingDate: string;
}

interface FileDownloadTabProps {
  documentData?: DocumentData;
}

export default function FileDownloadTab({ documentData }: FileDownloadTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePdfDownload = async () => {
    if (!documentData) return;
    setIsGenerating(true);
    try {
      // @react-pdf/renderer는 SSR 환경에서 동작하지 않으므로 동적으로 import
      const { pdf } = await import('@react-pdf/renderer');
      const { default: AppealClaimPdf } = await import('./AppealClaimPdf');
      const React = (await import('react')).default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(React.createElement(AppealClaimPdf, { data: documentData }) as any).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '행정심판_청구서.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10 max-w-3xl mx-auto">
      {/* 미리보기 썸네일 */}
      <div className="w-48 h-64 bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center shadow-sm gap-3">
        <FileText className="w-12 h-12 text-gray-300" />
        <p className="text-xs text-gray-400 font-medium">문서 미리보기</p>
      </div>

      <p className="text-sm text-gray-500 text-center">완성된 청구서를 원하는 형식으로 다운로드하세요.</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={handlePdfDownload}
          disabled={isGenerating || !documentData}
          className="w-full h-12 rounded-[10px] text-white text-[15px] font-semibold transition-colors disabled:opacity-60"
          style={{ background: '#1E1B4B' }}
        >
          {isGenerating ? 'PDF 생성 중...' : 'PDF 파일 다운로드'}
        </button>
      </div>
    </div>
  );
}
