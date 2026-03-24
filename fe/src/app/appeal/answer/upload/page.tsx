'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadForm from '@/components/form/UploadForm';
import SectionHeader from '../../_components/SectionHeader';
import { Button } from '@/components/ui/button';

export default function AnswerAttachPage() {
  const router = useRouter();
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

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const res = await fetch('/api/appeal/answer', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
      }

      router.push('/appeal/answer/report');
    } catch (err) {
      alert(err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileSizeMB = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) : null;

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
