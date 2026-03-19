'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ModalFrame from '@/components/ui/ModalFrame';
import UploadForm from '@/components/form/UploadForm';

import HeroSection from '@/app/_components/HeroSection';
import ProcessSection from '@/app/_components/ProcessSection';
import FeatureSection from '@/app/_components/FeatureSection';

export default function Home() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  // 임시 로그인 상태 (실제 서비스에서는 Context, Zustand, 쿠키 등에서 가져옵니다)
  const isLoggedIn = false;

  const handleStartConsultation = () => {
    if (!isLoggedIn) {
      // 로그인 안되어 있으면 로그인 모달 띄우기 (인터셉팅 라우트 트리거)
      router.push('/login');
    } else {
      // 로그인 되어 있으면 일단 아무 행동도 하지 않음
      // 나중에 setShowUpload(true) 등을 여기에 넣으면 됩니다.
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFileSelect = async (file: File) => {
    setIsVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsVerifying(false);
    } catch (error) {
      console.error(error);
      alert('처분서 분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsVerifying(false);
    }
  };

  // 기존 업로드 폼 (페이지 이동 없이 조건부 렌더링)
  if (showUpload) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 px-4 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#0f0f70]">처분서 업로드</h2>
          <Button variant="outline" onClick={() => setShowUpload(false)}>
            랜딩 페이지로 돌아가기
          </Button>
        </div>
        <UploadForm onFileSelect={handleFileSelect} acceptedTypes=".pdf, .jpg, .png" />
        {isVerifying && (
          <ModalFrame>
            <div>올리는중. . .</div>
          </ModalFrame>
        )}
      </div>
    );
  }

  // 랜딩 페이지 화면 (조립식으로 개선)
  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      <HeroSection onStartUpload={handleStartConsultation} />
      <ProcessSection />
      <FeatureSection />
    </div>
  );
}
