'use client';

import { startTransition, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getProgressSegments,
  isValidDetailStep,
  PROGRESS_STAGES,
  STAGE_CONFIG,
} from '@/lib/appeal-progress';
import { CASE_STATUS_MAP, type CaseStatus } from '@/lib/constants/caseStatus';
import { START_STAGE_PREVIEWS, STAGE_ACCENT_STYLES } from '@/lib/constants/dashboard';
import { type CaseListItem } from '@/lib/cases';
import { formatDate } from '@/lib/utils';

interface CreateCaseResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    caseNo: number;
    title: string;
    status: string;
    createdAt: string;
  } | null;
}

interface DashboardHomeProps {
  cases: CaseListItem[];
}

const EMPTY_CASE_DESCRIPTION =
  '새 케이스를 시작하면 진행 단계와 최근 업데이트가 이곳에 쌓입니다.\n처음 사건을 등록해 두면 이후 흐름을 한눈에 이어서 확인할 수 있어요.';

function getCaseUpdatedLabel(createdAt: string) {
  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return formatDate(parsedDate);
}

function getCaseTitle(item: CaseListItem) {
  return item.title?.trim() || `${item.caseNo}번 사건`;
}

function getCaseHref(baseHref: string, caseNo: number) {
  if (baseHref === '/appeal/survey') {
    return `${baseHref}?caseNo=${caseNo}`;
  }

  return baseHref;
}

export default function DashboardHome({ cases }: DashboardHomeProps) {
  const router = useRouter();
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  const handleCreateCase = async () => {
    if (isCreatingCase) {
      return;
    }

    setIsCreatingCase(true);

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        credentials: 'include',
      });

      const result = (await response.json().catch(() => null)) as CreateCaseResponse | null;
      if (!response.ok || result?.status !== 'SUCCESS' || !result.data?.caseNo) {
        throw new Error(result?.message || '새 케이스를 생성하지 못했습니다. 다시 시도해 주세요.');
      }

      const caseNo = String(result.data.caseNo);
      window.sessionStorage.setItem('currentCaseNo', caseNo);
      window.localStorage.setItem('currentCaseNo', caseNo);

      startTransition(() => {
        router.push(`/appeal/start?caseNo=${caseNo}`);
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : '새 케이스 생성 중 문제가 발생했습니다.');
    } finally {
      setIsCreatingCase(false);
    }
  };

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
                준비된 서류와 현재 진행 단계를 기준으로, 내 상황에 맞는 흐름에서 바로 이어서 시작할
                수 있어요.
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
                          <p className="text-[18px] font-bold text-white/92">필요한 서류</p>
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

        <button
          type="button"
          onClick={() => {
            void handleCreateCase();
          }}
          disabled={isCreatingCase}
          className="group flex h-full min-h-[260px] flex-col items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#2a2a97_0%,#1b1b84_100%)] px-6 py-8 text-center shadow-[0_16px_38px_rgba(15,15,112,0.18)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,15,112,0.24)] active:translate-y-0 disabled:cursor-wait disabled:opacity-90"
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
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-gray-900">
          최근 진행 중인 케이스
        </h2>

        {cases.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {cases.map((item) => {
              const statusInfo = CASE_STATUS_MAP[item.status as CaseStatus];
              if (!statusInfo) {
                return null;
              }

              const isValid = isValidDetailStep(statusInfo.majorStage, statusInfo.detailStep);
              const filledSegments = getProgressSegments(statusInfo.majorStage);
              const accent = STAGE_ACCENT_STYLES[statusInfo.majorStage];

              return (
                <Link
                  key={item.caseNo}
                  href={getCaseHref(statusInfo.href, item.caseNo)}
                  className="relative flex flex-col gap-6 rounded-2xl border border-[#eef2f9] bg-white p-8 pl-10 shadow-[0_10px_28px_rgba(15,15,112,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_18px_36px_rgba(15,15,112,0.10)]"
                >
                  <div className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl ${accent.line}`} />

                  <p className="line-clamp-2 text-[24px] font-bold leading-tight tracking-[-0.02em] text-gray-900">
                    {getCaseTitle(item)}
                  </p>

                  <div className="flex gap-2 self-start">
                    <span
                      className={`inline-block rounded-full px-3 py-1.5 text-sm font-semibold ${STAGE_CONFIG[statusInfo.majorStage].badgeClassName}`}
                    >
                      {statusInfo.majorStage}
                    </span>
                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600">
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-700">
                      <span
                        className={`mr-2 inline-block h-3 w-3 rounded-full align-middle ${accent.line}`}
                      />
                      <span className="font-semibold">현재 단계:</span>{' '}
                      {isValid ? statusInfo.detailStep || '-' : '상세 단계 정보 없음'}
                    </p>

                    <div className="flex items-center gap-2">
                      {PROGRESS_STAGES.map((stage, index) => (
                        <div
                          key={`${item.caseNo}-${stage}`}
                          className={`h-2.5 flex-1 rounded-full transition-colors ${
                            index < filledSegments ? 'bg-first' : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="text-sm text-gray-400">
                      최근 업데이트: {getCaseUpdatedLabel(item.createdAt)}
                    </span>
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
              <button
                type="button"
                onClick={() => {
                  void handleCreateCase();
                }}
                disabled={isCreatingCase}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-first/10 bg-first px-6 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(15,15,112,0.10)] transition hover:bg-first/92 disabled:cursor-wait disabled:opacity-90"
              >
                새 케이스 시작하기
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
