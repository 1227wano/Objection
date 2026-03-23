'use client';

const steps = [
  { label: '상담 및 진단' },
  { label: '청구서 작성' },
  { label: '답변서 수령' },
  { label: '위원회 심리' },
];

const COMPLETED_STEPS = 2;

export default function StepProgress() {
  return (
    <div className="flex items-center justify-center w-full mb-10">
      <div className="flex items-center w-full max-w-2xl">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= COMPLETED_STEPS;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.label} className="flex items-center flex-1">
              {/* 노드 + 라벨 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                    isCompleted ? 'bg-first text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap ${
                    isCompleted ? 'text-first' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* 연결선 */}
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-2 mb-6 ${
                    stepNumber < COMPLETED_STEPS ? 'bg-first' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
