'use client';

import Link from 'next/link';
import {
  getProgressSegments,
  isValidDetailStep,
  PROGRESS_STAGES,
  STAGE_CONFIG,
  type StageName,
} from '@/lib/appeal-progress';

interface MockCase {
  id: number;
  title: string;
  majorStage: StageName;
  detailStep: string;
  updatedAt: string;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

const TODAY = formatDate(new Date());

const MOCK_CASES: MockCase[] = [
  {
    id: 1,
    title: '마포구 사무실 용도변경 허가 거부 취소',
    majorStage: '행정심판청구서 작성',
    detailStep: '사건 경위 작성',
    updatedAt: TODAY,
  },
  {
    id: 2,
    title: '건축물 사용승인 반려 처분 취소',
    majorStage: '답변서 분석',
    detailStep: 'AI 분석 결과',
    updatedAt: TODAY,
  },
  {
    id: 3,
    title: '영업정지 처분 취소 청구',
    majorStage: '보충서면 작성',
    detailStep: '문서작성',
    updatedAt: TODAY,
  },
  {
    id: 4,
    title: '옥외영업 불허 처분 취소 청구',
    majorStage: '재결서 분석',
    detailStep: '재결서 분석',
    updatedAt: TODAY,
  },
];

const STAGE_ACCENT_STYLES: Record<StageName, { line: string; marker: string }> = {
  '처분서 분석': {
    line: 'bg-slate-500',
    marker: 'text-slate-500',
  },
  '행정심판청구서 작성': {
    line: 'bg-blue-600',
    marker: 'text-blue-600',
  },
  '답변서 분석': {
    line: 'bg-violet-500',
    marker: 'text-violet-500',
  },
  '보충서면 작성': {
    line: 'bg-emerald-500',
    marker: 'text-emerald-500',
  },
  '재결서 분석': {
    line: 'bg-amber-500',
    marker: 'text-amber-500',
  },
  '행정심판 완료': {
    line: 'bg-gray-500',
    marker: 'text-gray-500',
  },
};

export default function DashboardHome() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-16">
      <Link
        href="/appeal"
        className="group block rounded-[28px] border border-[#0b0b5a] bg-[linear-gradient(180deg,#16167d_0%,#0f0f70_100%)] p-6 shadow-[0_16px_38px_rgba(15,15,112,0.18)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,15,112,0.24)] active:translate-y-0"
      >
        <div className="rounded-[22px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.02)_100%)] px-6 py-10 transition-colors duration-200 sm:px-10 sm:py-12">
          <div className="flex flex-col items-center pt-2 text-center sm:pt-3">
            <div className="text-[104px] font-extralight leading-none text-white transition-transform duration-200 group-hover:scale-105">
              +
            </div>

            <p className="mt-4 text-[32px] font-extrabold tracking-[-0.04em] text-white sm:text-[38px]">
              새 케이스 생성
            </p>

            <p className="mt-3 text-base leading-7 text-white/80 sm:text-lg">
              처음이셔도 괜찮아요. 안내에 따라 천천히 진행하시면 됩니다.
            </p>

            <div className="mt-8 rounded-full bg-white px-6 py-3 text-lg font-bold text-first shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-200 group-hover:scale-105">
              시작하기
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-5">
        <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-gray-900">
          최근 진행 중인 케이스
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {MOCK_CASES.map((item) => {
            const isValid = isValidDetailStep(item.majorStage, item.detailStep);
            const filledSegments = getProgressSegments(item.majorStage);
            const accent = STAGE_ACCENT_STYLES[item.majorStage];

            return (
              <Link
                key={item.id}
                href={`/appeal/${item.id}`}
                className="relative flex flex-col gap-6 rounded-2xl border border-[#eef2f9] bg-white p-8 pl-10 shadow-[0_10px_28px_rgba(15,15,112,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_36px_rgba(15,15,112,0.10)]"
              >
                <div className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl ${accent.line}`} />

                <p className="line-clamp-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-gray-900">
                  {item.title}
                </p>

                <span
                  className={`inline-block self-start rounded-full px-3 py-1.5 text-sm font-semibold ${STAGE_CONFIG[item.majorStage].badgeClassName}`}
                >
                  {item.majorStage}
                </span>

                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-700">
                    <span
                      className={`mr-2 inline-block h-3 w-3 rounded-full align-middle ${accent.line}`}
                    />
                    <span className="font-semibold">세부 단계:</span>{' '}
                    {isValid ? item.detailStep || '-' : '설정되지 않은 단계'}
                  </p>

                  <div className="flex items-center gap-2">
                    {PROGRESS_STAGES.map((stage, index) => (
                      <div
                        key={`${item.id}-${stage}`}
                        className={`h-2.5 flex-1 rounded-full transition-colors ${
                          index < filledSegments ? 'bg-first' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="text-sm text-gray-400">최근 업데이트: {item.updatedAt}</span>
                  <span className="text-sm font-semibold text-first">
                    상세보기 &gt;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
