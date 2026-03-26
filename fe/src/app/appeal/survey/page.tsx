'use client';

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bot,
  Building2,
  CalendarDays,
  ChevronLeft,
  CircleHelp,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CURRENT_CASE_KEY = 'currentCaseNo';
const CURRENT_NOTICE_DOC_KEY = 'currentNoticeGovDocNo';

const CLAIMANT_OPTIONS = [
  {
    value: 'direct',
    title: '네, 제가 직접 청구합니다',
    description: '처분을 직접 받은 당사자로서 직접 청구를 진행합니다.',
    icon: UserRound,
  },
  {
    value: 'representative',
    title: '아니요, 대신 청구합니다',
    description: '대리인 또는 법정대리인 자격으로 청구를 진행합니다.',
    icon: UsersRound,
  },
] as const;

const ACTION_OPTIONS = ['영업 정지', '과징금 부과', '영업 허가 취소', '영업 폐쇄 명령'] as const;

const DATE_HELP_TEXT = {
  recognizedDate: {
    meaning: '처분이 있음을 실제로 알게 된 날',
    example: '우편(등기)을 직접 수령한 날, 처분 사실을 통지받은 날',
    deadline: '90일 이내',
  },
  actionDate: {
    meaning: '행정기관이 처분을 결정하고 효력이 발생한 날',
    example: '처분서에 적힌 처분일자, 공고가 효력을 발생한 날',
    deadline: '180일 이내',
  },
} as const;

interface NoticeDocumentParsedJson {
  agencyName?: string;
  disposalDate?: string;
  sanctionType?: string;
  etc?: Record<string, unknown>;
}

interface NoticeDocumentDetailResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data?: {
    govDocNo: number;
    documentType: string;
    parsedJson?: string | NoticeDocumentParsedJson | null;
  } | null;
}

interface CurrentUserResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data?: {
    userName?: string;
  } | null;
}

interface SurveySaveResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data?: unknown;
}

function resolveStoredValue(key: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
}

function resolveNoticeGovDocNo(caseNo: string | null) {
  if (!caseNo || typeof window === 'undefined') {
    return resolveStoredValue(CURRENT_NOTICE_DOC_KEY);
  }

  const storageKey = `${CURRENT_NOTICE_DOC_KEY}:${caseNo}`;
  return (
    window.sessionStorage.getItem(storageKey) ||
    window.localStorage.getItem(storageKey) ||
    resolveStoredValue(CURRENT_NOTICE_DOC_KEY)
  );
}

function normalizeActionType(value: string | undefined) {
  if (!value) {
    return '';
  }

  if (value.includes('영업정지')) {
    return ACTION_OPTIONS[0];
  }

  if (value.includes('과징금')) {
    return ACTION_OPTIONS[1];
  }

  if (value.includes('영업허가') && value.includes('취소')) {
    return ACTION_OPTIONS[2];
  }

  if (value.includes('영업') && value.includes('폐쇄')) {
    return ACTION_OPTIONS[3];
  }

  return '';
}

function normalizeDateValue(value: string | undefined) {
  if (!value) {
    return '';
  }

  const matched = value.match(/\d{4}-\d{2}-\d{2}/);
  return matched ? matched[0] : '';
}

function parseParsedJson(
  rawParsedJson: string | NoticeDocumentParsedJson | null | undefined,
): NoticeDocumentParsedJson | null {
  if (!rawParsedJson) {
    return null;
  }

  if (typeof rawParsedJson === 'string') {
    try {
      return JSON.parse(rawParsedJson) as NoticeDocumentParsedJson;
    } catch {
      return null;
    }
  }

  return rawParsedJson;
}

function normalizePersonName(value: string | null | undefined) {
  return value?.replace(/\s/g, '') ?? '';
}

function extractRepresentativeName(parsedJson: NoticeDocumentParsedJson) {
  const etc = parsedJson.etc;
  if (!etc) {
    return '';
  }

  const infoRecord =
    typeof etc['info'] === 'object' && etc['info'] !== null
      ? (etc['info'] as Record<string, unknown>)
      : null;
  const infoText = typeof etc['info'] === 'string' ? etc['info'] : '';

  const candidateKeys = ['대표자', '대표자명', '성명', '이름'];
  for (const key of candidateKeys) {
    const value = etc[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(etc)) {
    if (typeof value === 'string' && key.includes('대표자') && value.trim()) {
      return value;
    }
  }

  if (infoRecord) {
    for (const key of candidateKeys) {
      const value = infoRecord[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    for (const [key, value] of Object.entries(infoRecord)) {
      if (typeof value === 'string' && key.includes('대표자') && value.trim()) {
        return value;
      }
    }
  }

  if (infoText) {
    const matched = infoText.match(/대표자\s*([가-힣]+)/);
    if (matched?.[1]) {
      return matched[1];
    }
  }

  return '';
}

function sanitizeDateInput(value: string) {
  if (!value) {
    return '';
  }

  const [rawYear = '', rawMonth = '', rawDay = ''] = value.split('-');
  const year = rawYear.replace(/\D/g, '').slice(0, 4);
  const month = rawMonth.replace(/\D/g, '').slice(0, 2);
  const day = rawDay.replace(/\D/g, '').slice(0, 2);

  return [year, month, day].filter(Boolean).join('-');
}

export default function AppealSurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasUploadedNotice = searchParams.get('source') === 'upload';
  const helpLayerRef = useRef<HTMLDivElement | null>(null);

  const [claimantType, setClaimantType] = useState<(typeof CLAIMANT_OPTIONS)[number]['value'] | ''>(
    '',
  );
  const [actionType, setActionType] = useState<(typeof ACTION_OPTIONS)[number] | ''>('');
  const [recognizedDate, setRecognizedDate] = useState('');
  const [actionDate, setActionDate] = useState('');
  const [agency, setAgency] = useState('');
  const [openHelp, setOpenHelp] = useState<keyof typeof DATE_HELP_TEXT | null>(null);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  const selectedOptionClassName =
    'border-first/35 bg-[linear-gradient(180deg,#eef2ff_0%,#dfe6ff_100%)] text-first shadow-[0_18px_40px_rgba(15,15,112,0.10)]';

  useEffect(() => {
    if (!openHelp) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!helpLayerRef.current?.contains(event.target as Node)) {
        setOpenHelp(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [openHelp]);

  useEffect(() => {
    const caseNo = searchParams.get('caseNo') || resolveStoredValue(CURRENT_CASE_KEY);
    const govDocNo = resolveNoticeGovDocNo(caseNo);

    if (!caseNo || !govDocNo) {
      return;
    }

    let isMounted = true;

    async function hydrateSurveyFromNotice() {
      try {
        const [documentResponse, currentUserResponse] = await Promise.all([
          fetch(`/api/cases/${caseNo}/gov-documents/${govDocNo}`, {
            method: 'GET',
            credentials: 'include',
          }),
          fetch('/api/user/me', {
            method: 'GET',
            credentials: 'include',
          }),
        ]);

        if (!documentResponse.ok) {
          return;
        }

        const result = (await documentResponse
          .json()
          .catch(() => null)) as NoticeDocumentDetailResponse | null;
        if (result?.status !== 'SUCCESS' || result.data?.documentType !== 'NOTICE') {
          return;
        }

        const currentUserResult = currentUserResponse.ok
          ? ((await currentUserResponse.json().catch(() => null)) as CurrentUserResponse | null)
          : null;
        const parsedJson = parseParsedJson(result.data.parsedJson);
        if (!parsedJson || !isMounted) {
          return;
        }

        const nextActionType = normalizeActionType(parsedJson.sanctionType);
        const nextActionDate = normalizeDateValue(parsedJson.disposalDate);
        const nextAgency = parsedJson.agencyName?.trim() ?? '';
        const representativeName = extractRepresentativeName(parsedJson);
        const currentUserName = currentUserResult?.data?.userName ?? '';

        if (nextActionType) {
          setActionType(nextActionType);
        }

        if (nextActionDate) {
          setActionDate(nextActionDate);
          setRecognizedDate(nextActionDate);
        }

        if (nextAgency) {
          setAgency(nextAgency);
        }

        const normalizedCurrentUserName = normalizePersonName(currentUserName);
        const normalizedRepresentativeName = normalizePersonName(representativeName);

        console.log('survey notice autofill names', {
          currentUserName,
          representativeName,
          normalizedCurrentUserName,
          normalizedRepresentativeName,
          parsedJson,
        });

        if (normalizedCurrentUserName && normalizedRepresentativeName) {
          setClaimantType(
            normalizedCurrentUserName === normalizedRepresentativeName
              ? 'direct'
              : 'representative',
          );
        }
      } catch {
        // Keep the survey editable even when OCR lookup fails.
      }
    }

    void hydrateSurveyFromNotice();

    return () => {
      isMounted = false;
    };
  }, [hasUploadedNotice, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      isSubmittingSurvey ||
      !claimantType ||
      !actionType ||
      !recognizedDate ||
      !actionDate ||
      !agency.trim()
    ) {
      return;
    }

    const caseNo = searchParams.get('caseNo') || resolveStoredValue(CURRENT_CASE_KEY);
    if (!caseNo) {
      alert('사건 번호를 찾지 못했습니다. 처음부터 다시 진행해 주세요.');
      return;
    }

    setIsSubmittingSurvey(true);

    try {
      const response = await fetch(`/api/cases/${caseNo}/survey`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDirect: claimantType === 'direct',
          sanctionType: actionType,
          disposalDate: actionDate,
          awareDate: recognizedDate,
          agencyName: agency.trim(),
        }),
      });

      const result = (await response.json().catch(() => null)) as SurveySaveResponse | null;
      if (!response.ok || result?.status !== 'SUCCESS') {
        throw new Error(result?.message || '설문 저장에 실패했습니다. 다시 시도해 주세요.');
      }

      router.push('/appeal/documents');
    } catch (error) {
      alert(error instanceof Error ? error.message : '설문 저장 중 문제가 발생했습니다.');
    } finally {
      setIsSubmittingSurvey(false);
    }
  }

  function toggleHelp(key: keyof typeof DATE_HELP_TEXT) {
    setOpenHelp((current) => (current === key ? null : key));
  }

  function handleDateChange(setter: Dispatch<SetStateAction<string>>, nextValue: string) {
    setter(sanitizeDateInput(nextValue));
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_20%,#f3f6ff_100%)]">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-8 md:px-8 md:py-10 xl:px-10">
        <section className="mx-auto w-full max-w-[980px]">
          <div className="rounded-3xl border border-first/12 bg-white p-6 shadow-[0_18px_40px_rgba(15,15,112,0.10)] backdrop-blur md:p-10 xl:p-12">
            <div className="flex flex-col gap-4 pb-8">
              <div className="space-y-3">
                <h1 className="text-[30px] font-extrabold tracking-[-0.04em] text-slate-950 md:text-[38px]">
                  행정심판 진행에 필요한 기본 정보를 확인할게요
                </h1>
                <p className="mt-3 max-w-3xl whitespace-pre-line break-keep text-[17px] leading-8 text-second">
                  청구인 자격과 처분 내용을 확인하면 청구서 작성과 이후 절차가 훨씬 쉬워져요.
                </p>
              </div>

              {hasUploadedNotice ? (
                <div className="rounded-3xl border border-first/15 bg-[linear-gradient(135deg,#f2f5ff_0%,#e6ebff_100%)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-2xl bg-first/10 p-2 text-first">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-first">
                        업로드한 처분서를 바탕으로 일부 항목을 먼저 불러왔어요
                      </p>
                      <p className="break-keep text-sm leading-6 text-first/75">
                        내용이 맞는지 확인하고 필요한 부분만 수정해서 다음 단계로 진행해 주세요.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <form className="space-y-12" onSubmit={handleSubmit}>
              <section className="space-y-7">
                <h2 className="text-[26px] font-bold tracking-[-0.01em] text-slate-900">
                  1. 청구인 적격 확인
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {CLAIMANT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = claimantType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setClaimantType(option.value)}
                        className={`group rounded-3xl border p-6 text-left transition-all duration-200 ${
                          isSelected
                            ? selectedOptionClassName
                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-first/25 hover:shadow-[0_18px_40px_rgba(15,15,112,0.10)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="rounded-2xl bg-slate-100 p-3 text-slate-500 transition-colors group-hover:bg-first/8 group-hover:text-first">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                              isSelected
                                ? 'border-first/35 bg-first/12 text-first'
                                : 'border-slate-300 text-transparent'
                            }`}
                          >
                            ●
                          </div>
                        </div>

                        <div className="mt-8 space-y-2">
                          <p className="text-[24px] font-bold tracking-[-0.03em] text-slate-950">
                            {option.title}
                          </p>
                          <p className="whitespace-pre-line break-keep text-[15px] leading-7 text-slate-500">
                            {option.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-b border-slate-200" />
              </section>

              <section className="space-y-7">
                <h2 className="text-[26px] font-bold tracking-[-0.01em] text-slate-900">
                  2. 처분 대상 및 방식 확인
                </h2>

                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-slate-900">
                    어떤 불이익을 받으셨나요?
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {ACTION_OPTIONS.map((option) => {
                      const isSelected = actionType === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setActionType(option)}
                          className={`min-h-[52px] rounded-2xl border px-6 py-3 text-[15px] font-semibold transition-colors md:min-h-[50px] md:px-7 md:text-base ${
                            isSelected
                              ? selectedOptionClassName
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-first/20 hover:bg-first/5'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-b border-slate-200" />
              </section>

              <section className="space-y-7">
                <h2 className="text-[26px] font-bold tracking-[-0.01em] text-slate-900">
                  3. 기한 및 처분청 확인
                </h2>

                <div ref={helpLayerRef} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                      <CalendarDays className="h-4 w-4 text-first" />
                      처분을 알게 된 날
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleHelp('recognizedDate');
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-slate-300 transition hover:text-first"
                          aria-label="처분을 알게 된 날 설명 보기"
                          aria-expanded={openHelp === 'recognizedDate'}
                        >
                          <CircleHelp className="h-4 w-4" />
                        </button>

                        {openHelp === 'recognizedDate' ? (
                          <div className="absolute left-0 top-8 z-20 w-[320px] rounded-2xl border border-first/12 bg-white p-4 shadow-[0_18px_40px_rgba(15,15,112,0.10)]">
                            <div className="space-y-3 text-sm">
                              <div className="grid grid-cols-[72px_1fr] gap-2 border-b border-slate-100 pb-3">
                                <p className="font-semibold text-slate-500">의미</p>
                                <p className="whitespace-pre-line break-keep leading-6 text-slate-700">
                                  {DATE_HELP_TEXT.recognizedDate.meaning}
                                </p>
                              </div>
                              <div className="grid grid-cols-[72px_1fr] gap-2 border-b border-slate-100 pb-3">
                                <p className="font-semibold text-slate-500">기준 사례</p>
                                <p className="whitespace-pre-line break-keep leading-6 text-slate-700">
                                  {DATE_HELP_TEXT.recognizedDate.example}
                                </p>
                              </div>
                              <div className="grid grid-cols-[72px_1fr] gap-2">
                                <p className="font-semibold text-slate-500">청구 기한</p>
                                <p className="font-semibold leading-6 text-first">
                                  {DATE_HELP_TEXT.recognizedDate.deadline}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </span>
                    </div>
                    <input
                      id="recognized-date"
                      type="date"
                      value={recognizedDate}
                      min="1900-01-01"
                      max="9999-12-31"
                      onChange={(event) => handleDateChange(setRecognizedDate, event.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-first/45 focus:bg-[#f7f8ff]"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                      <CalendarDays className="h-4 w-4 text-first" />
                      처분이 있었던 날
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleHelp('actionDate');
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-slate-300 transition hover:text-first"
                          aria-label="처분이 있었던 날 설명 보기"
                          aria-expanded={openHelp === 'actionDate'}
                        >
                          <CircleHelp className="h-4 w-4" />
                        </button>

                        {openHelp === 'actionDate' ? (
                          <div className="absolute left-0 top-8 z-20 w-[320px] rounded-2xl border border-first/12 bg-white p-4 shadow-[0_18px_40px_rgba(15,15,112,0.10)]">
                            <div className="space-y-3 text-sm">
                              <div className="grid grid-cols-[72px_1fr] gap-2 border-b border-slate-100 pb-3">
                                <p className="font-semibold text-slate-500">의미</p>
                                <p className="whitespace-pre-line break-keep leading-6 text-slate-700">
                                  {DATE_HELP_TEXT.actionDate.meaning}
                                </p>
                              </div>
                              <div className="grid grid-cols-[72px_1fr] gap-2 border-b border-slate-100 pb-3">
                                <p className="font-semibold text-slate-500">기준 사례</p>
                                <p className="whitespace-pre-line break-keep leading-6 text-slate-700">
                                  {DATE_HELP_TEXT.actionDate.example}
                                </p>
                              </div>
                              <div className="grid grid-cols-[72px_1fr] gap-2">
                                <p className="font-semibold text-slate-500">청구 기한</p>
                                <p className="font-semibold leading-6 text-first">
                                  {DATE_HELP_TEXT.actionDate.deadline}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </span>
                    </div>
                    <input
                      id="action-date"
                      type="date"
                      value={actionDate}
                      min="1900-01-01"
                      max="9999-12-31"
                      onChange={(event) => handleDateChange(setActionDate, event.target.value)}
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition focus:border-first/45 focus:bg-[#f7f8ff]"
                      required
                    />
                  </div>

                  <label className="block space-y-3">
                    <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-700">
                      <Building2 className="h-4 w-4 text-first" />
                      처분 기관
                    </span>
                    <input
                      type="text"
                      value={agency}
                      onChange={(event) => setAgency(event.target.value)}
                      placeholder="예: OO구청, OO세무서"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-first/45 focus:bg-[#f7f8ff]"
                      required
                    />
                  </label>
                </div>

                <div className="border-b border-slate-200" />
              </section>

              <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-start px-0 text-slate-500 hover:bg-transparent hover:text-slate-900"
                  asChild
                >
                  <Link href="/appeal/start">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    이전 단계
                  </Link>
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmittingSurvey}
                  className="h-14 rounded-2xl px-8 text-base font-semibold shadow-[0_18px_40px_rgba(15,15,112,0.10)]"
                >
                  다음 단계로
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
