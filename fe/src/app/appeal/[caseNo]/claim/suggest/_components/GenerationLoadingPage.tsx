'use client';

import { useEffect } from 'react';

interface GenerationLoadingPageProps {
  documentPromise: Promise<any> | null;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export default function GenerationLoadingPage({
  documentPromise,
  onComplete,
  onError,
}: GenerationLoadingPageProps) {
  useEffect(() => {
    if (!documentPromise) return;

    documentPromise
      .then(() => onComplete())
      .catch((err) => onError(err instanceof Error ? err : new Error(String(err))));
  }, [documentPromise, onComplete, onError]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-white">
      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.88); }
        }
      `}</style>

      <div className="flex flex-col items-center gap-8 w-full max-w-[480px] px-6">
        {/* 로딩 오브 */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)',
            animation: 'orbPulse 2s ease-in-out infinite',
          }}
        >
          <span className="text-4xl select-none">⚖️</span>
        </div>

        {/* 텍스트 */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-[22px] font-bold text-[#111827]">청구서 초안을 작성하고 있어요</h2>
          <p className="text-sm text-[#6B7280]">AI가 입력한 정보를 분석하여 문서를 생성합니다.</p>
        </div>
      </div>
    </div>
  );
}
