'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  'AI가 생성한 내용은 한 번 더 확인해 주세요',
  '민감한 내용은 저장하지 않으니 안심해 주세요',
  '문서의 텍스트를 추출하고 있어요',
];

const LINE_WIDTHS = ['80%', '100%', '90%', '70%', '95%', '60%', '85%', '75%'];

export default function OcrLoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex w-full min-h-screen items-center justify-center">
      <style>{`
        @keyframes pageFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-10px) rotate(-2deg); }
        }
        @keyframes scanLine {
          0%   { top: 20px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 140px; opacity: 0; }
        }
        @keyframes fadeSwap {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1); }
        }
        @keyframes eyeMove {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(3px); }
          75%      { transform: translateX(-3px); }
        }
      `}</style>

      <div className="flex flex-col items-center gap-10">
        {/* 문서 일러스트 */}
        <div style={{ position: 'relative', width: 120, height: 160 }}>
          {/* 문서 카드 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              overflow: 'hidden',
              animation: 'pageFloat 3s ease-in-out infinite',
            }}
          >
            <div
              style={{
                paddingTop: 12,
                paddingLeft: 12,
                paddingRight: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              {LINE_WIDTHS.map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: w,
                    height: 7,
                    background: '#e5e7eb',
                    borderRadius: 9999,
                  }}
                />
              ))}
            </div>

            {/* 스캔 라인 */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background:
                  'linear-gradient(90deg, transparent, #6366F1, #818CF8, #6366F1, transparent)',
                animation: 'scanLine 2.2s ease-in-out infinite',
              }}
            />
          </div>

          {/* AI 눈 뱃지 */}
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: -14,
              width: 36,
              height: 36,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pageFloat 3s ease-in-out infinite',
            }}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              {/* 눈 윤곽 */}
              <circle cx="7" cy="7" r="5.5" stroke="#6366F1" strokeWidth="1.5" />
              {/* 동공 */}
              <circle
                cx="7"
                cy="7"
                r="2"
                fill="#6366F1"
                style={{ animation: 'eyeMove 2.2s ease-in-out infinite' }}
              />
              {/* 화살표 선 3개 */}
              <line x1="11" y1="7" x2="17" y2="7" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="4" x2="17" y2="7" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="10" x2="17" y2="7" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="text-center flex flex-col gap-5">
          {/* 타이틀 + 점 3개 */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl font-medium text-gray-900">AI가 문서를 읽고 있어요</p>
            <div className="flex items-center gap-[6px]">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#6366F1',
                    animation: `dotPulse 1.4s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 순환 메시지 */}
          <div style={{ height: 22, overflow: 'hidden' }}>
            <p
              key={msgIndex}
              className="text-sm text-gray-400"
              style={{ animation: 'fadeSwap 3.2s ease-in-out forwards' }}
            >
              {MESSAGES[msgIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
