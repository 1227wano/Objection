'use client';
import ModalFrame from '@/components/ui/ModalFrame';
import UploadForm from '@/components/form/UploadForm';
import { useState } from 'react';
export default function Home() {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileSelect = async (file: File) => {
    // 1. 파일이 들어오면 즉시 로딩 모달을 띄웁니다.
    setIsVerifying(true);

    try {
      // 2. 서버로 파일을 전송하고 AI 분석 결과를 기다립니다.
      // 실제 API 호출 코드 예시:
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/analyze', { method: 'POST', body: formData });

      // 테스트를 위한 가짜 딜레이 (3초 대기)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. 분석이 성공적으로 끝나면 다음 단계(예: 설문조사 페이지)로 이동합니다.
      setIsVerifying(false);
    } catch (error) {
      // 에러 발생 시 처리
      alert('처분서 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsVerifying(false); // 에러가 나면 모달을 닫고 다시 업로드할 수 있게 합니다.
    }
    // 페이지 이동(push)이 일어나면 컴포넌트가 언마운트되므로 finally는 생략해도 무방합니다.
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">처분서 업로드</h2>

      {/* 앞서 만든 파일 형식 검증 로직이 포함된 업로드 폼 */}
      <UploadForm onFileSelect={handleFileSelect} acceptedTypes=".pdf, .jpg, .png" />

      {/* isVerifying 상태에 따라 로딩 모달이 나타납니다. */}
      {isVerifying && <ModalFrame children={<div>올리는중. . .</div>} />}
    </div>
  );
}
