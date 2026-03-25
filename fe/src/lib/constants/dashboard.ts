import { StageName } from '@/lib/appeal-progress';

export interface StartStagePreview {
  title: string;
  description: string;
  requiredDocuments: string[];
  footerText: string;
}

export const START_STAGE_PREVIEWS: StartStagePreview[] = [
  {
    title: '처분서 단계',
    description: '처음 단계부터 차근차근 진행할 수 있어요.',
    requiredDocuments: ['처분서'],
    footerText: '설문부터 차근차근 진행할 수 있어요',
  },
  {
    title: '답변서 단계',
    description: '답변서를 받은 단계부터 이어서 \n시작할 수 있어요.',
    requiredDocuments: ['처분서', '행정심판 청구서', '답변서'],
    footerText: '청구서와 답변서를 올리면 분석을 시작해요',
  },
  {
    title: '재결서 단계',
    description: '재결서를 받은 경우 결과 확인 단계부터\n 바로 시작할 수 있어요.',
    requiredDocuments: ['재결서'],
    footerText: '재결서를 올리면 결과 확인 단계로 이어집니다',
  },
] as const;

export const STAGE_ACCENT_STYLES: Record<StageName, { line: string; marker: string }> = {
  '처분서 분석': {
    line: 'bg-slate-500',
    marker: 'text-slate-500',
  },
  '행정심판청구서 작성': {
    line: 'bg-blue-600',
    marker: 'text-blue-600',
  },
  '답변서 분석': {
    line: 'bg-violet-500',
    marker: 'text-violet-500',
  },
  '보충서면 작성': {
    line: 'bg-emerald-500',
    marker: 'text-emerald-500',
  },
  '재결서 분석': {
    line: 'bg-amber-500',
    marker: 'text-amber-500',
  },
  '행정심판 완료': {
    line: 'bg-gray-500',
    marker: 'text-gray-500',
  },
};
