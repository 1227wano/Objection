'use client';

import Link from 'next/link';
import {
  getProgressSegments,
  isValidDetailStep,
  PROGRESS_STAGES,
  STAGE_CONFIG,
} from '@/lib/appeal-progress';
import { CASE_STATUS_MAP, type CaseStatus } from '@/lib/constants/caseStatus';
import { START_STAGE_PREVIEWS, STAGE_ACCENT_STYLES } from '@/lib/constants/dashboard';
import { formatDate } from '@/lib/utils';



interface MockCase {
  id: number;
  title: string;
  status: CaseStatus;
  updatedAt: string;
}

const TODAY = formatDate(new Date());

const MOCK_CASES: MockCase[] = [
  {
    id: 1,
    title: '마포구 세무서 용도변경 허가 거부 취소',
    status: 'NARRATIVE_WRITING',
    updatedAt: TODAY,
  },
  {
    id: 2,
    title: '건축물 사용승인 반려 처분 취소',
    status: 'ANSWER_DONE',
    updatedAt: TODAY,
  },
  {
    id: 3,
    title: '영업정지 처분 취소 청구',
    status: 'SUPPLEMENT_DONE',
    updatedAt: TODAY,
  },
  {
    id: 4,
    title: '옥외영업 불허 처분 취소 청구',
    status: 'DECISION_DONE',
    updatedAt: TODAY,
  },
];



export default function DashboardHome() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-16">
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[2.15fr_1fr]">
        <div className="h-full rounded-[28px] border border-[#dce6fb] bg-[linear-gradient(180deg,#f4f8ff_0%,#eaf1ff_100%)] p-7 shadow-[0_10px_28px_rgba(15,15,112,0.08)]">
          <div className="flex h-full flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[30px] font-extrabold tracking-[-0.03em] text-gray-900">
                어느 단계에서든 시작할 수 있어요
              </p>
              <p className="max-w-3xl whitespace-pre-line text-[16px] leading-7 text-slate-500">
                처음부터 진행하셔도 되고, 이미 받은 서류가 있다면 현재 단계에 맞춰 바로 이어서
                시작할 수도 있어요.
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
                          마우스를 올려 자세히 보기
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
            처음이라도 괜찮아요. 안내에 따라 차근차근 진행하시면 됩니다.
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {MOCK_CASES.map((item) => {
            const statusInfo = CASE_STATUS_MAP[item.status];
            const isValid = isValidDetailStep(statusInfo.majorStage, statusInfo.detailStep);
            const filledSegments = getProgressSegments(statusInfo.majorStage);
            const accent = STAGE_ACCENT_STYLES[statusInfo.majorStage];

            return (
              <Link
                key={item.id}
                href={statusInfo.href}
                className="relative flex flex-col gap-6 rounded-2xl border border-[#eef2f9] bg-white p-8 pl-10 shadow-[0_10px_28px_rgba(15,15,112,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_36px_rgba(15,15,112,0.10)]"
              >
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl ${accent.line}`}
                />

                <p className="line-clamp-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-gray-900">
                  {item.title}
                </p>

                <div className="flex gap-2 self-start">
                  <span
                    className={`inline-block rounded-full px-3 py-1.5 text-sm font-semibold ${STAGE_CONFIG[statusInfo.majorStage].badgeClassName}`}
                  >
                    {statusInfo.majorStage}
                  </span>
                  <span className="inline-block rounded-full px-3 py-1.5 text-sm font-semibold bg-gray-100 text-gray-600">
                    {statusInfo.label}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-700">
                    <span
                      className={`mr-2 inline-block h-3 w-3 rounded-full align-middle ${accent.line}`}
                    />
                    <span className="font-semibold">현재 단계:</span>{' '}
                    {isValid ? statusInfo.detailStep || '-' : '정의되지 않은 단계'}
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
                  <span className="text-sm font-semibold text-first">상세보기 &gt;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
