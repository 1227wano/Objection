'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadForm from '@/components/form/UploadForm';
import SectionHeader from '../../_components/SectionHeader';
import { Button } from '@/components/ui/button';

export default function RulingUploadPage() {
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
      const res = await fetch('/api/appeal/ruling', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
      }

      router.push('/appeal/ruling/report');
    } catch (err) {
      alert(err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <SectionHeader
        title="재결서를 수령하셨나요?"
        description="수령하신 재결서를 올려주세요"
      />

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
            {isSubmitting ? '업로드 중...' : '업로드 및 다음으로'}
          </Button>
        </div>
      </div>
    </div>
  );
}
