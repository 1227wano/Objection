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

interface StartStagePreview {
  title: string;
  description: string;
  requiredDocuments: string[];
  footerText: string;
}

const START_STAGE_PREVIEWS: StartStagePreview[] = [
  {
    title: '처분서부터 시작하기',
    description: '처분서 내용을 먼저 확인하고\n기본 설문을 차근차근 이어갈 수 있어요.',
    requiredDocuments: ['처분서'],
    footerText: '설문부터 차근차근 진행할 수 있어요.',
  },
  {
    title: '답변서 등록부터 시작하기',
    description: '답변서를 이미 받은 경우라면\n필요 서류를 올리고 바로 이어갈 수 있어요.',
    requiredDocuments: ['처분서', '행정심판 청구서', '답변서'],
    footerText: '청구서와 답변서를 올리면 바로 분석을 시작해요.',
  },
  {
    title: '재결서 등록부터 시작하기',
    description: '재결서까지 받은 사건이라면\n결과 검토 단계부터 바로 이어갈 수 있어요.',
    requiredDocuments: ['재결서'],
    footerText: '재결서를 올리면 결과 확인 단계로 이어집니다.',
  },
] as const;

const MOCK_CASES: MockCase[] = [
  /*
  {
    id: 1,
    title: '식품위생법 영업정지 처분 취소 청구',
    majorStage: PROGRESS_STAGES[1],
    detailStep: STAGE_CONFIG[PROGRESS_STAGES[1]].detailSteps[0] ?? '',
    updatedAt: '2026.03.25',
  },
  {
    id: 2,
    title: '영업허가 취소 처분 답변서 분석',
    majorStage: PROGRESS_STAGES[2],
    detailStep: STAGE_CONFIG[PROGRESS_STAGES[2]].detailSteps[1] ?? '',
    updatedAt: '2026.03.25',
  },
  {
    id: 3,
    title: '과징금 부과 처분 사건 청구',
    majorStage: PROGRESS_STAGES[3],
    detailStep: STAGE_CONFIG[PROGRESS_STAGES[3]].detailSteps[0] ?? '',
    updatedAt: '2026.03.25',
  },
  {
    id: 4,
    title: '도시계획 처분 재결서 검토',
    majorStage: PROGRESS_STAGES[4],
    detailStep: STAGE_CONFIG[PROGRESS_STAGES[4]].detailSteps[1] ?? '',
    updatedAt: '2026.03.25',
  },
  */
];

const EMPTY_CASE_DESCRIPTION =
  '새 케이스를 시작하면 진행 단계와 최근 업데이트가 이곳에 쌓입니다.\n처음 사건을 등록해 두면 이후 흐름을 한눈에 이어서 확인할 수 있어요.';

const STAGE_ACCENT_STYLES: Partial<Record<StageName, { line: string; marker: string }>> = {
  [PROGRESS_STAGES[0]]: {
    line: 'bg-slate-500',
    marker: 'text-slate-500',
  },
  [PROGRESS_STAGES[1]]: {
    line: 'bg-blue-600',
    marker: 'text-blue-600',
  },
  [PROGRESS_STAGES[2]]: {
    line: 'bg-violet-500',
    marker: 'text-violet-500',
  },
  [PROGRESS_STAGES[3]]: {
    line: 'bg-emerald-500',
    marker: 'text-emerald-500',
  },
  [PROGRESS_STAGES[4]]: {
    line: 'bg-amber-500',
    marker: 'text-amber-500',
  },
};

export default function DashboardHome() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-16">
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[2.15fr_1fr]">
        <div className="h-full rounded-[28px] border border-[#dce6fb] bg-[linear-gradient(180deg,#f4f8ff_0%,#eaf1ff_100%)] p-7 shadow-[0_10px_28px_rgba(15,15,112,0.08)]">
          <div className="flex h-full flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[30px] font-extrabold tracking-[-0.03em] text-gray-900">
                어떤 단계에서든 바로 시작할 수 있어요
              </p>
              <p className="max-w-3xl whitespace-pre-line text-[16px] leading-7 text-slate-500">
                준비된 서류와 현재 진행 단계를 기준으로, 내 상황에 맞는 흐름에서 바로 이어서
                시작할 수 있어요.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {START_STAGE_PREVIEWS.map((item, index) => (
                <div key={item.title} className="group/card h-full [perspective:1400px]">
                  <div className="grid h-full min-h-[220px] transition-transform duration-500 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
                    <div className="col-start-1 row-start-1 [backface-visibility:hidden]">
                      <div className="flex h-full flex-col rounded-[24px] border border-[#dbe4f8] bg-white p-5 shadow-[0_8px_18px_rgba(15,15,112,0.06)] transition-colors duration-200 group-hover/card:border-first/15">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-first text-lg font-bold text-white">
                          {index + 1}
                        </div>

                        <p className="mt-4 text-[21px] font-extrabold tracking-[-0.03em] text-gray-900">
                          {item.title}
                        </p>

                        <p className="mt-3 whitespace-pre-line text-[14px] leading-6 text-slate-500">
                          {item.description}
                        </p>

                        <div className="mt-auto pt-4 text-[13px] font-semibold text-first/75">
                          뒤집어서 필요한 서류를 확인해 보세요
                        </div>
                      </div>
                    </div>

                    <div className="col-start-1 row-start-1 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="flex h-full flex-col rounded-[24px] border border-[#16135f] bg-first p-5 text-white shadow-[0_12px_26px_rgba(15,15,112,0.12)]">
                        <p className="text-[20px] font-extrabold tracking-[-0.03em] text-white">
                          {item.title}
                        </p>

                        <div className="mt-5">
                          <p className="text-[18px] font-bold text-white/92">필요 서류</p>
                          <div className="mt-2 h-px w-full bg-white/30" />
                        </div>

                        <ul className="mt-4 space-y-2 text-[17px] leading-7 text-white/92">
                          {item.requiredDocuments.map((listItem) => (
                            <li key={listItem} className="flex gap-3">
                              <span className="mt-[12px] h-2 w-2 shrink-0 rounded-full bg-white/85" />
                              <span className="break-keep">{listItem}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto whitespace-pre-line pt-4 text-[13px] font-semibold text-white/80">
                          {item.footerText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="/appeal/start"
          className="group flex h-full min-h-[260px] flex-col items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#2a2a97_0%,#1b1b84_100%)] px-6 py-8 text-center shadow-[0_16px_38px_rgba(15,15,112,0.18)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,15,112,0.24)] active:translate-y-0"
        >
          <div className="text-[84px] font-extralight leading-none text-white transition-transform duration-200 group-hover:scale-105">
            +
          </div>

          <p className="mt-3 text-[30px] font-extrabold tracking-[-0.04em] text-white">
            새 케이스 생성
          </p>

          <p className="mt-2 text-[15px] leading-7 text-white/80">
            처음 진행하는 사건이라면 여기서 시작하세요. 필요한 흐름을 차근차근 안내해 드립니다.
          </p>

          <div className="mt-6 rounded-full bg-white px-6 py-3 text-lg font-bold text-first shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-transform duration-200 group-hover:scale-105">
            시작하기
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-gray-900">
          최근 진행 중인 케이스
        </h2>

        {MOCK_CASES.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {MOCK_CASES.map((item) => {
              const isValid = isValidDetailStep(item.majorStage, item.detailStep);
              const filledSegments = getProgressSegments(item.majorStage);
              const accent = STAGE_ACCENT_STYLES[item.majorStage] ?? {
                line: 'bg-gray-500',
                marker: 'text-gray-500',
              };

              return (
                <Link
                  key={item.id}
                  href={`/appeal/${item.id}`}
                  className="relative flex flex-col gap-6 rounded-2xl border border-[#eef2f9] bg-white p-8 pl-10 shadow-[0_10px_28px_rgba(15,15,112,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_36px_rgba(15,15,112,0.10)]"
                >
                  <div
                    className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl ${accent.line}`}
                  />

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
                      <span className="font-semibold">현재 단계:</span>{' '}
                      {isValid ? item.detailStep || '-' : '상세 단계 정보 없음'}
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
                    <span className="text-sm font-semibold text-first">계속 확인하기 &gt;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-first/18 bg-[linear-gradient(180deg,#fbfcff_0%,#f6f8ff_100%)] px-8 py-16 text-center shadow-[0_10px_24px_rgba(15,15,112,0.04)]">
            <div className="mx-auto flex max-w-[560px] flex-col items-center">
              <p className="text-[32px] font-extrabold tracking-[-0.03em] text-gray-900 md:text-[36px]">
                아직 진행 중인 케이스가 없어요
              </p>
              <p className="mt-3 max-w-2xl whitespace-pre-line break-keep text-[16px] leading-7 text-slate-500">
                {EMPTY_CASE_DESCRIPTION}
              </p>
              <Link
                href="/appeal/start"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-first/10 bg-first px-6 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(15,15,112,0.10)] transition hover:bg-first/92"
              >
                새 케이스 시작하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
