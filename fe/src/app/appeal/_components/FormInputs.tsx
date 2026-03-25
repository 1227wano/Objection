'use client';

import { useFormContext } from 'react-hook-form';

/**
 * 편집 가능 필드 (일반)
 * - 연한 파란 배경 하이라이트로 "수정 가능" 표시
 * - hover 시 배경 약간 진해짐
 * - focus 시 링 + 배경 강조
 */
export function EditableInput({
  name,
  required = false,
  className = '',
}: {
  name: string;
  required?: boolean;
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // 필수 필드인데 비어있으면 에러 표시
  const hasError = required && errors[name];

  const baseStyle = [
    'w-full outline-none rounded px-1.5 py-0.5 transition-all duration-200',
    'border border-dashed',
  ];

  const normalStyle = [
    'bg-blue-50/70 border-blue-200',
    'hover:bg-blue-50 hover:border-blue-300',
    'focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400',
  ];

  const requiredStyle = [
    'bg-amber-50/80 border-amber-300',
    'hover:bg-amber-50 hover:border-amber-400',
    'focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-400',
  ];

  const errorStyle = [
    'bg-red-50/60 border-red-300',
    'hover:bg-red-50 hover:border-red-400',
    'focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-400',
  ];

  const stateStyle = hasError ? errorStyle : required ? requiredStyle : normalStyle;

  return (
    <div className="relative">
      <input
        type="text"
        {...register(name, required ? { required: '필수 입력 항목입니다' } : {})}
        className={[...baseStyle, ...stateStyle, className].join(' ')}
      />
      {required && (
        <span className="absolute -top-1.5 -right-1 text-amber-500 text-[10px] font-bold leading-none">
          *
        </span>
      )}
    </div>
  );
}

/**
 * 편집 가능 필드 (텍스트영역)
 * - 동일한 하이라이트 시스템 적용
 * - 필수 여부에 따라 색상 구분
 */
export function EditableTextarea({
  id,
  name,
  rows = 4,
  required = false,
  className = '',
}: {
  id?: string;
  name: string;
  rows?: number;
  required?: boolean;
  className?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const hasError = required && errors[name];

  const baseStyle = [
    'w-full outline-none rounded px-1.5 py-1 transition-all duration-200 resize-y leading-relaxed',
    'border border-dashed',
  ];

  const normalStyle = [
    'bg-blue-50/70 border-blue-200',
    'hover:bg-blue-50 hover:border-blue-300',
    'focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400',
  ];

  const requiredStyle = [
    'bg-amber-50/80 border-amber-300',
    'hover:bg-amber-50 hover:border-amber-400',
    'focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-400',
  ];

  const errorStyle = [
    'bg-red-50/60 border-red-300',
    'hover:bg-red-50 hover:border-red-400',
    'focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-400',
  ];

  const stateStyle = hasError ? errorStyle : required ? requiredStyle : normalStyle;

  return (
    <div className="relative">
      <textarea
        id={id}
        {...register(name, required ? { required: '필수 입력 항목입니다' } : {})}
        rows={rows}
        className={[...baseStyle, ...stateStyle, className].join(' ')}
      />
      {required && (
        <span className="absolute -top-1.5 -right-1 text-amber-500 text-[10px] font-bold leading-none">
          *
        </span>
      )}
    </div>
  );
}
