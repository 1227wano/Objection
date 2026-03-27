'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import PrecedentList from './PrecedentList';
import { PrecedentItem, PrecedentsResponse } from '../types';

const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

function resolveAnalysisNo(): number {
  if (typeof window === 'undefined') return 0;
  const val =
    window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
    window.localStorage.getItem(CURRENT_ANALYSIS_KEY);
  return val ? Number(val) : 0;
}

export default function PrecedentSection() {
  const [precedents, setPrecedents] = useState<PrecedentItem[]>([]);

  useEffect(() => {
    const analysisNo = resolveAnalysisNo();
    if (!analysisNo) return;

    apiClient
      .get<PrecedentsResponse>(`/analysis/${analysisNo}/precedents`)
      .then((res) => setPrecedents([res.data]))
      .catch(() => {});
  }, []);

  return <PrecedentList precedents={precedents} />;
}
