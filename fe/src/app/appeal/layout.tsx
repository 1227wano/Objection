'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/LeftSideBar';

export default function AppealLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePage =
    pathname === '/appeal/start' ||
    pathname === '/appeal/survey' ||
    pathname === '/appeal/documents';

  if (isStandalonePage) {
    return (
      <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
        <main className="h-full overflow-y-auto bg-white">{children}</main>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <Sidebar />
      <main className="h-full flex-1 overflow-y-auto bg-white pl-64">{children}</main>
    </div>
  );
}
