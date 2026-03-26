'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentInput } from '@/components/ui/DocumentInput';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import SectionHeader from '../../_components/SectionHeader';

const CURRENT_CASE_KEY = 'currentCaseNo';

function resolveCaseNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_CASE_KEY) || window.localStorage.getItem(CURRENT_CASE_KEY)
  );
}

interface CaseDetailsForm {
  facts: string;
  unfairReasons: string;
}

export default function CaseDetailsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const caseNo = resolveCaseNo();
    if (!caseNo) {
      alert('사건 번호를 찾을 수 없습니다. 대시보드에서 다시 시작해 주세요.');
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/cases/${caseNo}/narrative`, {
        fact: data.facts,
        opinion: data.unfairReasons,
      });
      router.push('/appeal/claim/report');
    } catch (error) {
      console.error('narrative 저장 실패:', error);
      alert('저장 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {isSubmitting ? '저장 중...' : '다음 단계로'}
              </Button>
            </div>
          </form>
        </DocumentCard>
      </div>
    </div>
  );
}
