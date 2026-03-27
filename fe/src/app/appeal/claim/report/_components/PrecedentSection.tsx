'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import PrecedentList from './PrecedentList';
import { PrecedentInfo, PrecedentsResponse, EnrichedPrecedent } from '../types';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveAnalysisNo(): number {
  if (typeof window === 'undefined') return 0;
  const val =
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY);
  return val ? Number(val) : 0;
}

interface PrecedentSectionProps {
  precedentInfos: PrecedentInfo[];
}

export default function PrecedentSection({ precedentInfos }: PrecedentSectionProps) {
  const [enriched, setEnriched] = useState<EnrichedPrecedent[]>(() =>
    precedentInfos.map((p) => ({ ...p, similarityScore: undefined })),
  );

  useEffect(() => {
    const analysisNo = resolveAnalysisNo();
    if (!analysisNo) return;

    apiClient
      .get<PrecedentsResponse>(`/analysis/${analysisNo}/precedents`)
      .then((res) => {
        const scoreMap: Record<string, number> = {};
        const item = res.data;
        if (item?.precedentNo) scoreMap[item.precedentNo] = item.similarityScore;

        setEnriched(
          precedentInfos.map((p) => ({
            ...p,
            similarityScore: scoreMap[p.precedentNo],
          })),
        );
      })
      .catch(() => {});
  }, [precedentInfos]);

  return <PrecedentList precedents={enriched} />;
}
