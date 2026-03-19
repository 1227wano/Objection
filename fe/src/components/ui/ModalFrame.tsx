'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface ModalFrameProps {
  children: React.ReactNode;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
}

export default function ModalFrame({
  children,
  onClose,
  closeOnOverlayClick = true,
}: ModalFrameProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));

    // 모달이 뜰 때 윈도우 스크롤바가 사라지면서 발생하는 화면 밀림 현상 방지
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    // 뒷 배경 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      // 정리 함수 - 원래대로 복구
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose(); // 직접 전달한 닫기 함수가 있으면 실행
    } else {
      router.back(); // 인터셉팅 라우트 등에서 기본 동작으로 뒤로 가기
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 배경(자신)을 클릭했고, 닫기 허용 상태일 때만 닫힙니다.
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      handleClose();
    }
  };

  // 서버 사이드 렌더링 에러 방지 및 클라이언트 마운트 확인
  if (!mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={handleOverlayClick}
    >
      {/* 모달 내용 부분 */}
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        {closeOnOverlayClick && (
          <button
            onClick={handleClose}
            className="absolute text-gray-500 top-4 right-4 hover:text-gray-700"
            aria-label="닫기"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>,
    modalRoot,
  );
}
