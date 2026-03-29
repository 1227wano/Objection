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
  // 애니메이션 모드일 경우 0부터 시작, 아닐 경우 즉시 완료 상태 표시
  const [revealed, setRevealed] = useState(animate ? 0 : completedSteps);

  useEffect(() => {
    if (!animate) return;

    // 초기 렌더링 후 약간의 지연 뒤에 순차적으로 채움
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        if (current < completedSteps) {
          current += 1;
          setRevealed(current);
        } else {
          clearInterval(interval);
        }
      }, 400); // 각 단계별 간격
      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(timer);
  }, [animate, completedSteps]);

  return (
    <div className="flex items-center justify-center w-full mb-10">
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        {/* 윗줄: 노드 + 연결선 */}
        <div className="flex items-center w-full relative mb-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber <= revealed;
            const isLast = index === steps.length - 1;
            
            // 연결선 활성화 여부: 현재 노드와 다음 노드 둘 다 완료되었을 때 채움
            const lineFilled = stepNumber < revealed;

            return (
              <div key={`node-${index}`} className={`flex items-center ${!isLast ? 'flex-1' : ''}`}>
                {/* 노드 (고정 폭 w-10) */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0
                    transition-all duration-500 z-10
                    ${isCompleted 
                      ? 'bg-first text-white border-first scale-100 shadow-sm' 
                      : 'bg-white border-2 border-gray-200 text-gray-400 scale-90'}`}
                  style={{
                    transitionDelay: isCompleted ? '50ms' : '0ms'
                  }}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>

                {/* 연결선 (남은 공간 flex-1) */}
                {!isLast && (
                  <div className="h-0.5 flex-1 mx-1 bg-gray-200 relative overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-first transition-all duration-700 ease-in-out"
                      style={{ 
                        width: lineFilled ? '100%' : '0%',
                        transitionDelay: lineFilled ? '150ms' : '0ms'
                      }}
                    />
                  </div>
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
                    style={{
                      transitionDelay: isCompleted ? '100ms' : '0ms'
                    }}
                  >
                    {step.label}
                  </span>
                </div>
                {/* 연결선과 대응되는 빈 공간 */}
                {!isLast && <div className="flex-1 mx-1" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
