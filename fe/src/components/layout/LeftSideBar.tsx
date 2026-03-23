'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, FileEdit, MessageSquareQuote, FilePlus, Gavel, CheckCircle2 } from 'lucide-react';

const MENU_STEPS = [
  {
    id: 'analysis',
    title: '처분서 분석',
    icon: Search,
    basePath: '/appeal/analysis',
  },
  {
    id: 'claim',
    title: '행정심판청구서 작성',
    icon: FileEdit,
    basePath: '/appeal/claim',
    subMenus: [
      { path: '/appeal/claim/incident', title: '사건 경위 작성' },
      { path: '/appeal/claim/report', title: 'AI 분석 결과' },
      { path: '/appeal/claim/suggest', title: 'AI 제안' },
      { path: '/appeal/claim/write', title: '문서 작성' },
      { path: '/appeal/claim/complete', title: '완료' },
    ],
  },
  {
    id: 'answer',
    title: '답변서 분석',
    icon: MessageSquareQuote,
    basePath: '/appeal/answer/attach',
    subMenus: [
      { path: '/appeal/answer/attach', title: '답변서 첨부' },
      { path: '/appeal/answer/result', title: 'AI 분석 결과' },
    ],
  },
  {
    id: 'supplement',
    title: '보충서면 작성',
    icon: FilePlus,
    basePath: '/appeal/supplement/case',
    subMenus: [
      { path: '/appeal/supplement/case', title: '보충 경위서 작성' },
      { path: '/appeal/supplement/suggest', title: 'AI 제안' },
      { path: '/appeal/supplement/write', title: '문서 작성' },
      { path: '/appeal/supplement/done', title: '완료' },
    ],
  },
  {
    id: 'ruling',
    title: '재결서 분석',
    icon: Gavel,
    basePath: '/appeal/ruling/attach',
    subMenus: [
      { path: '/appeal/ruling/attach', title: '재결서 첨부' },
      { path: '/appeal/ruling/analysis', title: '재결서 분석' },
    ],
  },
  {
    id: 'complete',
    title: '행정심판 완료',
    icon: CheckCircle2,
    basePath: '/appeal/complete',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-[#f4f7fb] border-r border-gray-200 flex flex-col z-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex-1 p-5 pt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-8 ml-2">진행상황</h2>

        <nav className="relative flex flex-col gap-8 pb-10">
          {/* 중앙 수직 선 */}
          <div className="absolute left-[18px] top-4 bottom-8 w-1 bg-gray-200 z-0 rounded-full" />

          {/* 각 단계 렌더링 */}
          {MENU_STEPS.map((step) => {
            const isCurrent = pathname.startsWith(step.basePath);
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative z-10 flex flex-col">
                {/* 메인 스텝 (동그라미 + 제목) */}
                <Link
                  href={step.subMenus ? step.subMenus[0].path : step.basePath}
                  className="flex items-center gap-4 group"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                      ${
                        isCurrent
                          ? 'bg-[#1B1965] text-white shadow-md'
                          : 'bg-[#D1D5DB] text-white group-hover:bg-gray-400'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`font-bold text-[15px] transition-colors
                      ${isCurrent ? 'text-[#1B1965]' : 'text-gray-400 group-hover:text-gray-600'}
                    `}
                  >
                    {step.title}
                  </span>
                </Link>

                {/* 하위 메뉴 (스르륵 열리는 아코디언 애니메이션) */}
                {step.subMenus && (
                  <div
                    className={`grid transition-all duration-300 ease-in-out
                      ${isCurrent ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}
                    `}
                  >
                    <div className="overflow-hidden">
                      {/* 내부 여백과 들여쓰기 */}
                      <div className="flex flex-col gap-3.5 ml-[56px] py-1">
                        {step.subMenus.map((sub) => {
                          const isSubActive = pathname === sub.path;
                          return (
                            <Link
                              href={sub.path}
                              key={sub.path}
                              className={`relative pl-3 text-[14px] font-semibold transition-colors
                                ${isSubActive ? 'text-[#1B1965]' : 'text-gray-400 hover:text-gray-700'}
                              `}
                            >
                              {/* 활성화된 하위 메뉴 좌측의 파란색 바 */}
                              {isSubActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#1B1965] rounded-full" />
                              )}
                              {sub.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
