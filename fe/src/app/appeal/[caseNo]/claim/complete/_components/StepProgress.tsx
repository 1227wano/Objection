'use client';

import { useEffect, useState } from 'react';

const DEFAULT_STEPS = [
  { label: '상담 및 진단' },
  { label: '청구서 작성' },
  { label: '답변서 수령' },
  { label: '위원회 심리' },
];

interface StepProgressProps {
  steps?: { label: string }[];
  completedSteps?: number;
  animate?: boolean;
}

export default function StepProgress({
  steps = DEFAULT_STEPS,
  completedSteps = 2,
  animate = false,
}: StepProgressProps) {
  const [revealed, setRevealed] = useState(animate ? 0 : completedSteps);

  useEffect(() => {
    if (!animate) return;
    let current = 0;
    const tick = () => {
      if (current < completedSteps) {
        current += 1;
        setRevealed(current);
        setTimeout(tick, 350);
      }
    };
    const start = setTimeout(tick, 200);
    return () => clearTimeout(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center w-full mb-10">
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        {/* 윗줄: 노드 + 연결선 */}
        <div className="flex items-center w-full relative mb-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= revealed;
            const isLast = index === steps.length - 1;
            const lineActive = stepNumber < revealed;

            return (
              <div key={`node-${index}`} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
                {/* 노드 (고정 폭 w-10) */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0
                    transition-all duration-500
                    ${isCompleted ? 'bg-first text-white scale-100' : 'bg-gray-200 text-gray-400 scale-90'}`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>

                {/* 연결선 (남은 공간 flex-1) */}
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors duration-500
                      ${lineActive ? 'bg-first' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 아랫줄: 라벨 */}
        <div className="flex w-full">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= revealed;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={`label-${index}`}
                className={`flex items-center ${!isLast ? 'flex-1' : ''}`}
              >
                {/* 라벨 (노드와 같은 w-10 영역에서 중앙 정렬) */}
                <div className="w-10 flex justify-center shrink-0">
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-colors duration-500
                      ${isCompleted ? 'text-first' : 'text-gray-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {/* 연결선과 대응되는 빈 공간 (가로 공간 확보) */}
                {!isLast && <div className="flex-1 mx-2" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
