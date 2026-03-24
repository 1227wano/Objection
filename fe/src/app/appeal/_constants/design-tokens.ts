/**
 * /appeal 전역 디자인 토큰
 */

export const LAYOUT_MAX_W = {
  standalone: 'max-w-[980px]',
  center: 'max-w-3xl',
  withRight: 'max-w-4xl',
  wide: 'max-w-6xl',
} as const;

export const CARD_RADIUS = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
} as const;

export const ELEVATION = {
  sm: 'shadow-sm',
  md: 'shadow-[0_10px_28px_rgba(15,15,112,0.06)]',
  lg: 'shadow-[0_18px_40px_rgba(15,15,112,0.10)]',
  hover: 'hover:shadow-[0_16px_32px_rgba(15,15,112,0.10)]',
} as const;

export const CTA_LABELS = {
  next: '다음 단계로',
  submit: '수정 완료',
  upload: '업로드 및 분석 시작',
  nextPhase: '다음 절차로',
} as const;
