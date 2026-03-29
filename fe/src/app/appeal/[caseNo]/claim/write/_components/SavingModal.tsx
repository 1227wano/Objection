'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface SavingModalProps {
  isOpen: boolean;
}

export default function SavingModal({ isOpen }: SavingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <style>{`
        @keyframes modalSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="bg-white flex flex-col items-center gap-5"
        style={{
          maxWidth: 360,
          width: '100%',
          margin: '0 16px',
          borderRadius: 16,
          padding: '40px 32px',
        }}
      >
        {/* 스피너 */}
        <div
          className="w-10 h-10 rounded-full border-4"
          style={{
            borderColor: '#E5E7EB',
            borderTopColor: '#6366F1',
            animation: 'modalSpin 0.8s linear infinite',
          }}
        />

        {/* 텍스트 */}
        <div className="text-center flex flex-col gap-1">
          <p className="text-lg font-bold text-[#111827]">수정중입니다</p>
          <p className="text-sm text-[#6B7280]">잠시만 기다려 주세요.</p>
        </div>
      </div>
    </div>
  );

  return modalRoot ? createPortal(content, modalRoot) : content;
}
