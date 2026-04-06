'use client';

import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/LeftSideBar';

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  const { caseNo } = useParams<{ caseNo: string }>();

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <Sidebar caseNo={caseNo} />
      <main className="h-full flex-1 overflow-y-auto bg-white pl-64">{children}</main>
    </div>
  );
}
