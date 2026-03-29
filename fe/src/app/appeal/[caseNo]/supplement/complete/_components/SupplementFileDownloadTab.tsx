'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { SupplementDocumentData } from '../../write/_types/document';

interface Props {
  documentData: SupplementDocumentData;
}

export default function SupplementFileDownloadTab({ documentData }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePdfDownload = async () => {
    if (!documentData?.submissionContent?.length) return;
    setIsGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: SupplementPdf } = await import('./SupplementPdf');
      const React = (await import('react')).default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(
        React.createElement(SupplementPdf, { data: documentData }) as any,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '보충서면.pdf';
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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full h-auto">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900">보충서면 PDF 다운로드</h2>
          <p className="text-sm text-gray-500">
            인쇄하여 등기 우편으로 제출하거나 온라인 첨부파일로 활용하실 수 있습니다.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handlePdfDownload}
        disabled={isGenerating || !documentData?.submissionContent?.length}
        className="w-full sm:w-auto px-6 h-12 rounded-[10px] text-white text-[15px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
        style={{ background: '#1E1B4B' }}
      >
        <Download className="w-4 h-4" />
        {isGenerating ? 'PDF 생성 중...' : 'PDF 다운로드'}
      </button>
    </div>
  );
}
