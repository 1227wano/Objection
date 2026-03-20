'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, FileEdit, MessageSquareQuote, FilePlus, Gavel, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

// 1. 개별 메뉴 아이템 컴포넌트 (인라인처럼 쓰기 위해 분리)
interface NavItemProps {
  href: string;
  icon?: React.ElementType;
  children: ReactNode;
  isActive?: boolean;
}

const NavItem = ({ href, icon: Icon, children, isActive }: NavItemProps) => (
  <Link
    href={href}
    className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-colors text-sm',
      isActive ? 'bg-[#1B1965] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    )}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span className="flex-1">{children}</span>
  </Link>
);

// 2. 서브 아이템
const SubItem = ({ href, children, isActive }: NavItemProps) => (
  <Link
    href={href}
    className={cn(
      'block py-1.5 text-xs transition-colors relative before:mr-1 ml-9 border-l-2 pl-2',
      isActive
        ? 'border-[#1B1965] text-[#1B1965] font-bold'
        : 'border-gray-100 text-gray-400 hover:text-gray-700 hover:border-gray-200',
    )}
  >
    {children}
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  // 현재 경로가 특정 메뉴의 하위 경로인지 확인하는 헬퍼 함수
  const startsWith = (path: string) => pathname.startsWith(path);

  return (
    <aside className="w-64 fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[#f4f7fb] border-r border-gray-200 flex flex-col z-40 overflow-y-auto">
      <nav className="flex-1 p-4 space-y-1">
        {/* 진행상황 타이틀 */}
        <div className="px-3 pb-2 pt-2">
          <h2 className="text-m font-bold text-gray-700">진행상황</h2>
        </div>

        <NavItem href="/appeal/analysis" icon={Search} isActive={startsWith('/appeal/analysis')}>
          처분서 분석
        </NavItem>

        <div className="space-y-1">
          <NavItem
            href="/appeal/claim/incident"
            icon={FileEdit}
            isActive={startsWith('/appeal/claim')}
          >
            행정심판청구서 작성
          </NavItem>
          {startsWith('/appeal/claim') && (
            <>
              <SubItem
                href="/appeal/claim/incident"
                isActive={pathname === '/appeal/claim/incident'}
              >
                사건 경위 작성
              </SubItem>
              <SubItem href="/appeal/claim/report" isActive={pathname === '/appeal/claim/report'}>
                AI 분석 결과
              </SubItem>
              <SubItem href="/appeal/claim/suggest" isActive={pathname === '/appeal/claim/suggest'}>
                AI 제안
              </SubItem>
              <SubItem href="/appeal/claim/write" isActive={pathname === '/appeal/claim/write'}>
                문서 작성
              </SubItem>
              <SubItem href="/appeal/claim/done" isActive={pathname === '/appeal/claim/done'}>
                완료
              </SubItem>
            </>
          )}
        </div>

        <div className="space-y-1">
          <NavItem
            href="/appeal/answer"
            icon={MessageSquareQuote}
            isActive={startsWith('/appeal/answer')}
          >
            답변서 분석
          </NavItem>
          {startsWith('/appeal/answer') && (
            <>
              <SubItem href="/appeal/answer/attach" isActive={pathname === '/appeal/answer/attach'}>
                답변서 첨부
              </SubItem>
              <SubItem href="/appeal/answer/result" isActive={pathname === '/appeal/answer/result'}>
                AI 분석 결과
              </SubItem>
            </>
          )}
        </div>

        <div className="space-y-1">
          <NavItem
            href="/appeal/supplement"
            icon={FilePlus}
            isActive={startsWith('/appeal/supplement')}
          >
            보충서면 작성
          </NavItem>
          {startsWith('/appeal/supplement') && (
            <>
              <SubItem
                href="/appeal/supplement/case"
                isActive={pathname === '/appeal/supplement/case'}
              >
                보충 경위서 작성
              </SubItem>
              <SubItem
                href="/appeal/supplement/suggest"
                isActive={pathname === '/appeal/supplement/suggest'}
              >
                AI 제안
              </SubItem>
              <SubItem
                href="/appeal/supplement/write"
                isActive={pathname === '/appeal/supplement/write'}
              >
                문서 작성
              </SubItem>
              <SubItem
                href="/appeal/supplement/done"
                isActive={pathname === '/appeal/supplement/done'}
              >
                완료
              </SubItem>
            </>
          )}
        </div>

        <div className="space-y-1">
          <NavItem href="/appeal/ruling" icon={Gavel} isActive={startsWith('/appeal/ruling')}>
            재결서 분석
          </NavItem>
          {startsWith('/appeal/ruling') && (
            <>
              <SubItem href="/appeal/ruling/attach" isActive={pathname === '/appeal/ruling/attach'}>
                재결서 첨부
              </SubItem>
              <SubItem
                href="/appeal/ruling/analysis"
                isActive={pathname === '/appeal/ruling/analysis'}
              >
                재결서 분석
              </SubItem>
            </>
          )}
        </div>
        <NavItem
          href="/appeal/complete"
          icon={CheckCircle2}
          isActive={pathname === '/appeal/complete'}
        >
          행정심판 완료
        </NavItem>
      </nav>
    </aside>
  );
}
