'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentInput } from '@/components/ui/DocumentInput';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import SectionHeader from '../../../_components/SectionHeader';
import RightSidebar from './_components/RightSidebar';
import AnalysisLoadingScreen from '../../../_components/AnalysisLoadingScreen';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 120; // 최대 3분 (1.5초 × 120)

interface AnalysisStatusResponse {
  status: string;
  message: string;
  data: {
    precedentResult: unknown;
    [key: string]: unknown;
  } | null;
}

async function pollUntilDone(analysisNo: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const res = await apiClient.get<AnalysisStatusResponse>(`/analysis/${analysisNo}`);
    if (res.data?.precedentResult !== null && res.data?.precedentResult !== undefined) {
      return;
    }
  }
  throw new Error('AI 분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.');
}

function resolveGovDocNo(caseNo: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = `govDocNo_${caseNo}_NOTICE`;
  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
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

// ── 메인 페이지 ────────────────────────────────────────
export default function SupplementCasePage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
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
        caseStage: 'APPEAL',
      });

      if (result.status !== 'SUCCESS' || !result.data?.analysisNo) {
        throw new Error(result.message || 'AI 분석 요청에 실패했습니다.');
      }

      const analysisNo = String(result.data.analysisNo);

      // 5) analysisNo 저장
      persistAnalysisNo(analysisNo);

      // 6) 분석 완료까지 폴링 대기 (precedentResult가 null이 아닐 때까지)
      await pollUntilDone(analysisNo);

      // 7) 보충서면 분석 결과 페이지로 이동
      router.push(`/appeal/${caseNo}/supplement/report`);
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
    return (
      <AnalysisLoadingScreen
        title="보충서면 전략을 수립하고 있어요"
        checklist={[
          { text: '답변서를 꼼꼼히 읽어보셨나요?', hint: '피청구인 주장을 파악해야 반박이 가능해요' },
          { text: '반박할 핵심 포인트를 정리해뒀나요?', hint: '구체적일수록 설득력이 높아집니다' },
          { text: '주장을 뒷받침할 추가 증거가 있나요?', hint: '새로운 자료가 있다면 이 단계에서 제출하세요' },
          { text: '처분 이후 추가로 발생한 피해가 있나요?', hint: '피해 규모가 클수록 감경 가능성이 높아요' },
          { text: '사실관계 오류를 발견하셨나요?', hint: '피청구인의 사실 오인은 강력한 반박 근거예요' },
        ]}
        tips={[
          '보충서면은 피청구인 답변서 수령 후 제출하는 최후 반박 기회입니다.',
          '구체적인 사실과 증거를 중심으로 작성할수록 인용 가능성이 높아집니다.',
          '감정적 표현보다 법적 근거와 사실관계 중심으로 작성하는 게 효과적이에요.',
          '보충서면은 분량보다 핵심 논점의 명확성이 더 중요합니다.',
          '제출 전 사건번호와 당사자 정보가 정확한지 반드시 확인하세요.',
        ]}
      />
    );
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
