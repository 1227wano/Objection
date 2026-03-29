'use client';

import StepProgress from './StepProgress';

interface CompletionHeaderProps {
  title?: string;
  description?: string;
  steps?: { label: string }[];
  completedSteps?: number;
}

export default function CompletionHeader({
  title = '행정심판 청구서 작성이 완료되었습니다.',
  description = '아래 두 가지 방법 중 편하신 방식을 선택하여 제출을 진행해 주세요.',
  steps,
  completedSteps,
}: CompletionHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-10 text-center">
      {/* Step Progress inside Header */}
      <StepProgress animate={true} steps={steps} completedSteps={completedSteps} />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-base text-gray-500">{description}</p>
      </div>
    </div>
  );
}
