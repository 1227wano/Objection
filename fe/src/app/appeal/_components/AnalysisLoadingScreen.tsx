'use client';

import { useState, useEffect } from 'react';

interface AnalysisLoadingScreenProps {
  title: string;
  checklist: {
    text: string;
    hint: string;
  }[];
  tips: string[];
}

export default function AnalysisLoadingScreen({
  title,
  checklist,
  tips,
}: AnalysisLoadingScreenProps) {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [tipIndex, setTipIndex] = useState(0);
  const [tipAnim, setTipAnim] = useState<'in' | 'out' | 'idle'>('idle');

  const allChecked = checkedIds.size === checklist.length;
  const progress = checklist.length > 0 ? (checkedIds.size / checklist.length) * 100 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setTipAnim('out');
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setTipAnim('in');
        setTimeout(() => setTipAnim('idle'), 350);
      }, 350);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  function toggleCheck(id: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const accentColor = allChecked ? '#1D9E75' : '#6366F1';
  const accentBg = allChecked ? '#ECFDF5' : '#EEF2FF';
  const accentBorder = allChecked ? '#6EE7B7' : '#C7D2FE';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes checkPop { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes tipIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tipOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .tip-in { animation: tipIn 0.35s ease forwards; }
        .tip-out { animation: tipOut 0.35s ease forwards; }
        .check-pop { animation: checkPop 0.25s ease forwards; }
      `}</style>

      <div className="w-full max-w-[520px] mx-auto flex flex-col gap-6">

        {/* ① 스피너 + 타이틀 */}
        <div
          className="flex flex-col items-center gap-4"
          style={{ animation: 'fadeInUp 0.5s ease forwards' }}
        >
          {/* 스피너 */}
          <div className="relative w-12 h-12">
            {/* 외곽 회전 border */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid #E0E7FF',
                borderTopColor: '#6366F1',
                animation: 'spin 1s linear infinite',
              }}
            />
            {/* 내부 원 + 시계 아이콘 */}
            <div
              className="absolute inset-[5px] rounded-full flex items-center justify-center"
              style={{ background: '#EEF2FF' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#6366F1" strokeWidth="2" />
                <path d="M12 7v5l3 3" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* 타이틀 */}
          <p style={{ fontSize: 17, fontWeight: 600, color: '#111827', textAlign: 'center' }}>
            {title}
          </p>

          {/* dotPulse */}
          <div className="flex gap-1.5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#6366F1',
                  animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ② 체크리스트 카드 */}
        <div
          className="bg-white flex flex-col gap-3"
          style={{
            border: '0.5px solid #E5E7EB',
            borderRadius: 16,
            padding: '20px 22px',
            animation: 'fadeInUp 0.5s ease 0.1s both',
          }}
        >
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">기다리는 동안 미리 확인해보세요</p>
              <p className="text-xs text-gray-400 mt-0.5">체크하며 준비 상태를 점검해 보세요</p>
            </div>
            <span
              className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full transition-colors duration-300"
              style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}
            >
              {checkedIds.size} / {checklist.length}
            </span>
          </div>

          {/* 진행 바 */}
          <div className="w-full h-[3px] rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: accentColor,
                transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
              }}
            />
          </div>

          {/* 아이템 목록 */}
          <ul className="flex flex-col gap-2 mt-1">
            {checklist.map((item, idx) => {
              const checked = checkedIds.has(idx);
              return (
                <li
                  key={idx}
                  className="flex items-start gap-3 cursor-pointer transition-colors duration-200"
                  style={{
                    border: `0.5px solid ${checked ? '#C7D2FE' : '#E5E7EB'}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    background: checked ? '#EEF2FF' : 'white',
                  }}
                  onClick={() => toggleCheck(idx)}
                >
                  {/* 체크박스 */}
                  <div
                    className="shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: 5,
                      background: checked ? '#6366F1' : 'white',
                      border: `1.5px solid ${checked ? '#6366F1' : '#C4B5FD'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {checked && (
                      <svg
                        className="check-pop"
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                      >
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p
                      className="leading-snug transition-colors duration-200"
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: checked ? '#4338CA' : '#374151',
                        textDecoration: checked ? 'line-through' : 'none',
                      }}
                    >
                      {item.text}
                    </p>
                    <p className="mt-0.5" style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {item.hint}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ③ 알고 계셨나요? 카드 */}
        <div
          className="overflow-hidden"
          style={{
            border: '0.5px solid #E5E7EB',
            borderRadius: 14,
            animation: 'fadeInUp 0.5s ease 0.2s both',
          }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center gap-2 px-[18px] py-[10px]"
            style={{ background: '#6366F1' }}
          >
            {/* info 원형 아이콘 */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8.25" stroke="white" strokeWidth="1.5" />
              <path d="M9 8v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="9" cy="5.5" r="0.75" fill="white" />
            </svg>
            <span className="text-white text-xs font-semibold">알고 계셨나요?</span>
          </div>

          {/* 바디 */}
          <div
            className="bg-white px-[18px] py-[14px]"
            style={{ minHeight: 56 }}
          >
            <p
              className={tipAnim === 'out' ? 'tip-out' : tipAnim === 'in' ? 'tip-in' : ''}
              style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}
            >
              {tips[tipIndex]}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
