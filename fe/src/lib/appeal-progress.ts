export const STAGE_CONFIG = {
  '처분서 분석': {
    detailSteps: [],
    badgeClassName: 'bg-slate-100 text-slate-700',
  },
  '행정심판청구서 작성': {
    detailSteps: ['사건 경위 작성', 'AI 분석 결과', 'AI 제안', '문서작성', '완료'],
    badgeClassName: 'bg-blue-100 text-blue-700',
  },
  '답변서 분석': {
    detailSteps: ['답변서 첨부', 'AI 분석 결과'],
    badgeClassName: 'bg-violet-100 text-violet-700',
  },
  '보충서면 작성': {
    detailSteps: ['보충 경위서 작성', 'AI 제안', '문서작성', '완료'],
    badgeClassName: 'bg-emerald-100 text-emerald-700',
  },
  '재결서 분석': {
    detailSteps: ['재결서 첨부', '재결서 분석'],
    badgeClassName: 'bg-amber-100 text-amber-700',
  },
  '행정심판 완료': {
    detailSteps: [],
    badgeClassName: 'bg-gray-100 text-gray-700',
  },
} as const;

export type StageName = keyof typeof STAGE_CONFIG;

export const PROGRESS_STAGES: StageName[] = [
  '처분서 분석',
  '행정심판청구서 작성',
  '답변서 분석',
  '보충서면 작성',
  '재결서 분석',
];

export function getProgressSegments(stage: StageName) {
  if (stage === '행정심판 완료') {
    return PROGRESS_STAGES.length;
  }

  return PROGRESS_STAGES.findIndex((item) => item === stage) + 1;
}

export function isValidDetailStep(stage: StageName, detailStep: string) {
  const { detailSteps } = STAGE_CONFIG[stage];
  const steps = detailSteps as readonly string[];
  if (detailSteps.length === 0) {
    return detailStep === '';
  }

  return steps.includes(detailStep);
}
