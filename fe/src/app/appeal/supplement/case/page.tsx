'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentInput } from '@/components/ui/DocumentInput';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import SectionHeader from '../../_components/SectionHeader';
import RightSidebar from './_components/RightSidebar';

const CURRENT_CASE_KEY = 'currentCaseNo';
const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';
const CURRENT_NOTICE_DOC_KEY = 'currentNoticeGovDocNo';

function resolveCaseNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_CASE_KEY) || window.localStorage.getItem(CURRENT_CASE_KEY)
  );
}

function resolveGovDocNo(caseNo: string): string | null {
  if (typeof window === 'undefined') return null;
  const perCaseKey = `${CURRENT_NOTICE_DOC_KEY}:${caseNo}`;
  return (
    window.sessionStorage.getItem(perCaseKey) ||
    window.localStorage.getItem(perCaseKey) ||
    window.sessionStorage.getItem(CURRENT_NOTICE_DOC_KEY) ||
    window.localStorage.getItem(CURRENT_NOTICE_DOC_KEY)
  );
}

function persistAnalysisNo(analysisNo: string) {
  window.sessionStorage.setItem(CURRENT_ANALYSIS_KEY, analysisNo);
  window.localStorage.setItem(CURRENT_ANALYSIS_KEY, analysisNo);
}

interface SupplementCaseForm {
  additionalFacts: string;
  rebuttalOpinion: string;
}

interface AnalysisResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    analysisNo: number;
    [key: string]: unknown;
  } | null;
}

type PageStep = 'form' | 'loading';

// ── 로딩 화면 ──────────────────────────────────────────
function AnalysisLoadingScreen() {
  return (
    <div className="flex w-full min-h-[60vh] items-center justify-center">
      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.88); }
        }
      `}</style>

      <div className="flex flex-col items-center gap-8 w-full max-w-[480px] px-6">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)',
            animation: 'orbPulse 2s ease-in-out infinite',
          }}
        >
          <span className="text-4xl select-none">⚖️</span>
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className="text-[22px] font-bold text-[#111827]">보충서면 전략을 수립하고 있어요</h2>
          <p className="text-sm text-[#6B7280]">
            입력하신 내용을 바탕으로 법리 분석 및 전략을 수립합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────
export default function SupplementCasePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageStep, setPageStep] = useState<PageStep>('form');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplementCaseForm>({
    defaultValues: {
      additionalFacts: '',
      rebuttalOpinion: '',
    },
  });

  const onSubmit: SubmitHandler<SupplementCaseForm> = async (data) => {
    const caseNo = resolveCaseNo();
    if (!caseNo) {
      alert('사건 번호를 찾을 수 없습니다. 대시보드에서 다시 시작해 주세요.');
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) 보충 경위서 저장
      await apiClient.post(`/cases/${caseNo}/narrative`, {
        fact: data.additionalFacts,
        opinion: data.rebuttalOpinion,
      });

      // 2) govDocNo 확인
      const govDocNo = resolveGovDocNo(caseNo);
      if (!govDocNo) {
        throw new Error(
          '처분서 문서 번호를 찾을 수 없습니다. 처분서 업로드 단계를 먼저 완료해 주세요.',
        );
      }

      // 3) 로딩 화면 전환
      setPageStep('loading');

      // 4) AI 분석 요청 (보충서면 단계)
      const result = await apiClient.post<AnalysisResponse>(`/cases/${caseNo}/analysis`, {
        govDocNo: Number(govDocNo),
        caseStage: 'REPLY',
      });

      if (result.status !== 'SUCCESS' || !result.data?.analysisNo) {
        throw new Error(result.message || 'AI 분석 요청에 실패했습니다.');
      }

      // 5) analysisNo 저장
      persistAnalysisNo(String(result.data.analysisNo));

      // 6) 보충서면 분석 결과 페이지로 이동
      router.push('/appeal/supplement/report');
    } catch (error) {
      console.error('보충 경위서 저장 또는 AI 분석 실패:', error);
      alert(
        error instanceof Error ? error.message : '처리 중 문제가 발생했습니다. 다시 시도해 주세요.',
      );
      setPageStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageStep === 'loading') {
    return <AnalysisLoadingScreen />;
  }

  return (
    <div className="flex w-full min-h-screen animate-in fade-in duration-500">
      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex justify-center py-12 md:py-16">
        <div className="w-full max-w-4xl px-8 flex flex-col">
          <SectionHeader
            title="보충서면 작성을 위한 의견을 적어주세요"
            description={<>피청구인에 대해서 반박하는 내용으로 작성해주세요</>}
          />

          <div className="w-full">
            <DocumentCard>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* 필드 1: 사실관계 추가사항 */}
                <div className="flex flex-col gap-2 relative">
                  <DocumentInput
                    label="1. 사실관계 추가사항"
                    placeholder="피청구인의 답변서에서 사실과 다르거나 빠진 부분이 있다면 적어주세요."
                    {...register('additionalFacts', { required: true })}
                  />
                  {errors.additionalFacts && (
                    <span className="text-red-500 text-[14px] font-semibold pl-1 absolute -bottom-6">
                      사실관계 추가사항을 입력해주세요.
                    </span>
                  )}
                </div>

                {/* 필드 2: 반박의견 */}
                <div className="flex flex-col gap-2 relative mt-4">
                  <DocumentInput
                    label="2. 반박의견"
                    placeholder="피청구인의 주장에 대해 반박하고 싶은 내용을 구체적으로 작성해주세요."
                    {...register('rebuttalOpinion', { required: true })}
                  />
                  {errors.rebuttalOpinion && (
                    <span className="text-red-500 text-[14px] font-semibold pl-1 absolute -bottom-6">
                      반박의견을 입력해주세요.
                    </span>
                  )}
                </div>

                <div className="flex justify-end pt-8">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '분석 요청 중...' : '다음 단계로'}
                  </Button>
                </div>
              </form>
            </DocumentCard>
          </div>
        </div>
      </div>

      {/* 우측 사이드바: 답변서 요약 */}
      <RightSidebar />
    </div>
  );
}
