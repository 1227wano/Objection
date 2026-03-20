'use client';

import { useRouter } from 'next/navigation';

import HeroSection from '@/app/_components/HeroSection';
import ProcessSection from '@/app/_components/ProcessSection';
import FeatureSection from '@/app/_components/FeatureSection';

export default function Home() {
  const router = useRouter();

  // 임시 로그인 상태 (실제 서비스에서는 Context, Zustand, 쿠키 등에서 가져옵니다)
  const isLoggedIn = false;
  const handleStartConsultation = () => {
    if (!isLoggedIn) {
      // 로그인 안되어 있으면 로그인 모달 띄우기 (인터셉팅 라우트 트리거)
      router.push('/login');
    } else {
      // 컴포넌트 폴더 구조 분리로 인해 업로드 폼은 /appeal/notice-upload 등으로 이동할 계획입니다.
      // 나중에 로그인 후 이동할 올바른 주소로 router.push('/appeal/start') 등을 연결하세요.
    }
  };

  // 랜딩 페이지 화면 (조립식으로 개선)
  return (
    <div className="w-full flex flex-col bg-mainbgcolor">
      <button onClick={() => router.push('/appeal/analysis')}>행정심판으로</button>;
      <HeroSection onStartUpload={handleStartConsultation} />
      <ProcessSection />
      <FeatureSection />
    </div>
  );
}
