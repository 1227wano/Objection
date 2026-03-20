'use client';

import Link from 'next/link';

// 최근 사건 mock 데이터 (추후 API 연동)
const MOCK_CASES = [
  {
    id: 1,
    title: '마포구 사무실 용도변경 허가 거부 취소',
    badge: '행정심판청구서 작성',
    badgeColor: 'bg-blue-100 text-blue-700',
    step: '사건 경위 작성',
    progress: 45,
    updatedAt: '3일 전',
  },
  {
    id: 2,
    title: '역삼동 음식점 영업 정지 처분',
    badge: '답변서 분석',
    badgeColor: 'bg-purple-100 text-purple-700',
    step: 'AI 분석 완료',
    progress: 70,
    updatedAt: '3일 전',
  },
  {
    id: 3,
    title: '마포구 사무실 용도변경 허가 거부 취소',
    badge: '행정심판청구서 작성',
    badgeColor: 'bg-blue-100 text-blue-700',
    step: '사건 경위 작성',
    progress: 30,
    updatedAt: '3일 전',
  },
];

export default function DashboardHome() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 py-16 flex flex-col gap-12">
      {/* 새로운 심판 진행하기 카드 */}
      <Link href="/appeal">
        <div className="w-full border-2 border-dashed border-blue-300 rounded-2xl py-20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <span className="text-2xl font-bold text-first">+</span>
          </div>
          <span className="text-base font-semibold text-gray-600 group-hover:text-first transition-colors">
            새로운 행정 심판 진행하기
          </span>
        </div>
      </Link>

      {/* 최근 진행한 사건들 */}
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold text-gray-900">최근 진행한 사건들</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_CASES.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 제목 */}
              <p className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                {c.title}
              </p>

              {/* 상태 뱃지 */}
              <span
                className={`inline-block self-start text-sm font-semibold px-3 py-1.5 rounded-full ${c.badgeColor}`}
              >
                {c.badge}
              </span>

              {/* 세부 단계 + 프로그레스바 */}
              <div className="flex flex-col gap-2.5">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">● 세부 단계: </span>
                  {c.step}
                </p>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-first rounded-full transition-all"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>

              {/* 하단: 날짜 + 상세보기 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                <span className="text-sm text-gray-400">최근 업데이트: {c.updatedAt}</span>
                <Link
                  href={`/appeal/${c.id}`}
                  className="text-sm font-semibold text-first hover:underline"
                >
                  상세보기 &gt;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
