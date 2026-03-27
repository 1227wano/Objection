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

function resolveCaseNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_CASE_KEY) || window.localStorage.getItem(CURRENT_CASE_KEY)
  );
}

interface SupplementCaseForm {
  additionalFacts: string;
  rebuttalOpinion: string;
}

export default function SupplementCasePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      await apiClient.post(`/cases/${caseNo}/narrative`, {
        fact: data.additionalFacts,
        opinion: data.rebuttalOpinion,
      });
      router.push('/appeal/supplement/suggest');
    } catch (error) {
      console.error('보충 경위서 저장 실패:', error);
      alert('저장 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    {isSubmitting ? '저장 중...' : '다음 단계로'}
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
