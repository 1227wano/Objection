'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DocumentCard } from '@/components/ui/DocumentCard';
import { DocumentInput } from '@/components/ui/DocumentInput';
import { Button } from '@/components/ui/button';

interface CaseDetailsForm {
  facts: string;
  unfairReasons: string;
}

export default function CaseDetailsPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<CaseDetailsForm>({
    defaultValues: {
      facts: '',
      unfairReasons: '',
    },
  });

  const onSubmit: SubmitHandler<CaseDetailsForm> = (data) => {
    console.log('임시 저장 데이터:', data);
    router.push('/appeal/claim/report');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center p-4 py-12 md:py-24">
      <div className="mb-8 w-full text-left">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          행정심판 청구를 위한 사건 경위를 작성해 주세요.
        </h1>
        <p className="mt-3 ml-2 text-sm text-second sm:text-base">
          처분이 부당하다고 느낀 당시의 상황과 억울한 점을 있는 그대로 알려 주세요.
          <br />
          남겨 주신 내용을 바탕으로 설득력 있는 소명 자료를 완성합니다.
        </p>
      </div>

      <div className="w-full">
        <DocumentCard>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col gap-2 relative">
              <DocumentInput
                label="1. 사실관계"
                placeholder="사건이 발생한 경위를 시간 순서대로 상세히 작성해 주세요."
                {...register('facts', { required: true })}
              />
              {errors.facts && <span className="text-red-500 text-[14px] font-semibold pl-1 absolute -bottom-6">사연을 입력해주세요.</span>}
            </div>

            <div className="flex flex-col gap-2 relative mt-4">
              <DocumentInput
                label="2. 부당하다고 생각하는 이유"
                placeholder="해당 처분이 왜 부당하거나 위법한지 구체적으로 작성해 주세요."
                {...register('unfairReasons', { required: true })}
              />
              {errors.unfairReasons && <span className="text-red-500 text-[14px] font-semibold pl-1 absolute -bottom-6">사연을 입력해주세요.</span>}
            </div>

            <div className="flex justify-end pt-8">
              <Button type="submit">다음 단계로 이동하기</Button>
            </div>
          </form>
        </DocumentCard>
      </div>
    </div>
  );
}
