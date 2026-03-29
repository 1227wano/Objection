'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface EvidenceItem {
  id: string;
  label: string;
}

interface ConfirmModalProps {
  checkedItems: EvidenceItem[];
  onBack: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ checkedItems, onBack, onConfirm }: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  const modalRoot = document.getElementById('modal-root');

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onBack();
      }}
    >
      <div
        className="w-full bg-white flex flex-col"
        style={{
          maxWidth: 440,
          borderRadius: 16,
          padding: '36px 32px 28px',
          margin: '0 16px',
        }}
      >
        {/* 아이콘 + 제목 */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <span className="text-4xl">📑</span>
          <h2 className="text-[18px] font-bold text-[#111827] text-center">
            준비된 증거인지 확인해 주세요
          </h2>
          <p className="text-sm text-[#6B7280] text-center leading-relaxed">
            아래 자료를 기반으로 행정심판 청구서 초안을 생성합니다.
            <br />
            실제 제출 시 해당 증거 원본이 필요합니다.
          </p>
        </div>

        {/* 체크된 증거 목록 */}
        <div className="flex flex-col gap-2 mb-7">
          {checkedItems.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] text-center py-4">
              체크된 증거 항목이 없습니다.
            </p>
          ) : (
            checkedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 px-4 py-3 rounded-[10px]"
                style={{ background: '#F9FAFB' }}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-[#111827] font-medium">{item.label}</span>
              </div>
            ))
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 h-12 rounded-[10px] border text-[15px] font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E5E7EB', color: '#6B7280', background: '#fff' }}
          >
            돌아가기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-12 rounded-[10px] text-white text-[15px] font-semibold transition-colors hover:opacity-90"
            style={{ background: '#1E1B4B' }}
          >
            네, 생성할게요
          </button>
        </div>
      </div>
    </div>
  );

  return modalRoot ? createPortal(content, modalRoot) : content;
}
