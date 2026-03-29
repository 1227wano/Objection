'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UploadForm from '@/components/form/UploadForm';
import SectionHeader from '../../../_components/SectionHeader';
import { Button } from '@/components/ui/button';

function getSourceType(file: File) {
  return file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
}

export default function AnswerAttachPage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;

    if (!caseNo) {
      alert('사건 번호를 찾을 수 없습니다. 대시보드에서 다시 시작해 주세요.');
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('documentType', 'ANSWER');
      formData.append('sourceType', getSourceType(uploadedFile));
      formData.append('file', uploadedFile);

      const res = await fetch(`/api/cases/${caseNo}/gov-documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
      }

      const result = await res.json();
      if (result.data?.govDocNo) {
        const key = `govDocNo_${caseNo}_ANSWER`;
        window.sessionStorage.setItem(key, String(result.data.govDocNo));
        window.localStorage.setItem(key, String(result.data.govDocNo));
      }

      router.push(`/appeal/${caseNo}/answer/report`);
    } catch (err) {
      alert(err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <SectionHeader title="답변서를 수령하셨나요?" description="수령하신 답변서를 올려주세요" />

      <div className="w-full space-y-4 mt-8">
        <div className="min-h-64">
          <UploadForm
            acceptedTypes=".pdf, .jpg, .png"
            onFileSelect={handleFileSelect}
            onFileRemove={handleRemoveFile}
            selectedFile={uploadedFile}
          />
        </div>
        <div className="flex justify-end mt-10">
          <Button onClick={handleSubmit} disabled={!uploadedFile || isSubmitting}>
            {isSubmitting ? '업로드 중...' : '업로드 및 분석 시작'}
          </Button>
        </div>
      </div>
    </div>
  );
}
