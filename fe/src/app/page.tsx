import { cookies } from 'next/headers';
import { isTokenExpired } from '@/lib/auth';

import HeroSection from '@/app/_components/HeroSection';
import DashboardHome from '@/app/_components/DashboardHome';
import ProcessSection from '@/app/_components/ProcessSection';
import FeatureSection from '@/app/_components/FeatureSection';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const isLoggedIn = !!token && !isTokenExpired(token);

  // 로그인 상태: 대시보드 + 하단 섹션
  if (isLoggedIn) {
    return (
      <div className="w-full flex flex-col bg-mainbgcolor">
        <DashboardHome />
        <ProcessSection />
        <FeatureSection />
      </div>
    );
  }

  // 비로그인 상태: 영웅 섹션 + 하단 섹션
  return (
    <div className="w-full flex flex-col bg-mainbgcolor">
      <HeroSection />
      <ProcessSection />
      <FeatureSection />
    </div>
  );
}
