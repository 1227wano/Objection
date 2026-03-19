import Sidebar from '@/components/layout/LeftSideBar';

export default function AppealLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* 사이드바도 자체 스크롤 (필요시) */}
      <Sidebar />

      {/* 🌟 여기가 핵심! 메인 콘텐츠 영역만 따로 스크롤되게 만듭니다.
      <main className="flex-1 h-full pl-64 overflow-y-auto bg-white">{children}</main> */}
    </div>
  );
}
