import Sidebar from '@/components/layout/LeftSideBar';

export default function AppealLayout({ children }: { children: React.ReactNode }) {
  return (
    // 🌟 1. 전체 높이(100vh)에서 헤더 높이(3.5rem)를 뺀 만큼만 차지하도록 고정하고, 창 자체의 스크롤은 막습니다.
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden relative">
      <Sidebar />

      {/* 🌟 2. 메인 영역: 여기서만 사이드바 여백(pl-64)과 자체 스크롤(overflow-y-auto)을 가집니다. */}
      <main className="flex-1 h-full pl-64 overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
