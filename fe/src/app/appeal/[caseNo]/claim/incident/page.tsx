'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentInput } from '@/components/ui/DocumentInput';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import SectionHeader from '../../../_components/SectionHeader';
import AnalysisLoadingScreen from '../../../_components/AnalysisLoadingScreen';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveGovDocNo(caseNo: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = `govDocNo_${caseNo}_NOTICE`;
  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
}

function persistAnalysisNo(analysisNo: string) {
  window.sessionStorage.setItem(CURRENT_ANALYSIS_KEY, analysisNo);
  window.localStorage.setItem(CURRENT_ANALYSIS_KEY, analysisNo);
}

interface CaseDetailsForm {
  facts: string;
  unfairReasons: string;
}

interface AnalysisResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    analysisNo: number;
    status: string;
    estimatedSeconds?: number;
    [key: string]: unknown;
  } | null;
}

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

/**
 * precedentResult가 null이 아닐 때까지 폴링
 */
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

type PageStep = 'form' | 'loading';

// ── 메인 페이지 ────────────────────────────────────────
export default function CaseDetailsPage() {
  const router = useRouter();
  const { caseNo } = useParams<{ caseNo: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageStep, setPageStep] = useState<PageStep>('form');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseDetailsForm>({
    defaultValues: {
      facts: '',
      unfairReasons: '',
    },
  });

  const onSubmit: SubmitHandler<CaseDetailsForm> = async (data) => {
    if (!caseNo) {
      alert('사건 번호를 찾을 수 없습니다. 대시보드에서 다시 시작해 주세요.');
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1) 사건 경위 저장
      await apiClient.post(`/cases/${caseNo}/narrative`, {
        fact: data.facts,
        opinion: data.unfairReasons,
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

      // 4) AI 분석 요청 (백엔드는 PROCESSING 상태로 즉시 응답)
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

      // 6) 분석 완료까지 폴링 대기
      await pollUntilDone(analysisNo);

      // 7) 분석 결과 페이지로 이동
      router.push(`/appeal/${caseNo}/claim/report`);
    } catch (error) {
      console.error('사건 경위 저장 또는 AI 분석 실패:', error);
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
        title="AI가 사건을 분석하고 있어요"
        checklist={[
          { text: '처분통지서 원본을 보관하고 있나요?', hint: '심판 중 언제든 제출 요구가 있을 수 있어요' },
          { text: '처분을 안 날짜를 정확히 기억하나요?', hint: '청구 기간(90일) 계산의 기준이 됩니다' },
          { text: '관련 사진·영수증 등 증거를 모아뒀나요?', hint: '자료가 많을수록 유리해요' },
          { text: '처분 이후 시정 노력을 한 게 있나요?', hint: '자발적 개선 노력은 감경 사유가 됩니다' },
          { text: '이전 행정 처분 기록이 있나요?', hint: '초범 여부 확인에 중요한 자료예요' },
        ]}
        tips={[
          '행정심판은 행정소송보다 평균 3~4배 빠르게 결과가 나옵니다.',
          '행정심판 인용률은 약 15~20% 수준이지만, 전문적 준비로 크게 높아집니다.',
          '집행정지 신청을 하면 심판 결과 전까지 처분 효력을 멈출 수 있어요.',
          '행정심판은 비용이 무료이며 변호사 없이도 직접 청구할 수 있습니다.',
          '청구서 제출 후 위원회는 60일 이내에 재결을 내려야 합니다.',
        ]}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <SectionHeader
        title="행정심판 청구를 위한 사건 경위를 작성해 주세요."
        description={
          <>
            처분이 부당하다고 느낀 당시의 상황과 억울한 점을 있는 그대로 알려 주세요.
            <br />
            남겨 주신 내용을 바탕으로 설득력 있는 소명 자료를 완성합니다.
          </>
        }
      />

      <div className="w-full">
        <DocumentCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col gap-2 relative">
              <DocumentInput
                label="1. 사실관계"
                placeholder="사건이 발생한 경위를 시간 순서대로 상세히 작성해 주세요."
                {...register('facts', { required: true })}
              />
              {errors.facts && (
                <span className="text-red-500 text-[14px] font-semibold pl-1 absolute -bottom-6">
                  사연을 입력해주세요.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 relative mt-4">
              <DocumentInput
                label="2. 부당하다고 생각하는 이유"
                placeholder="해당 처분이 왜 부당하거나 위법한지 구체적으로 작성해 주세요."
                {...register('unfairReasons', { required: true })}
              />
              {errors.unfairReasons && (
                <span className="text-red-500 text-[14px] font-semibold pl-1 absolute -bottom-6">
                  사연을 입력해주세요.
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
  );
}
