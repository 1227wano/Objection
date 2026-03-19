'use client';

import { useState, useEffect } from 'react';
import { ANALYSIS_MOCK_DATA, AnalysisData } from '../_types/analysis';

export function useNoticeAnalysis() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // API 호출을 흉내냅니다.
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        // 1초 대기 후 목데이터 로드
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAnalysisData(ANALYSIS_MOCK_DATA);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  return { analysisData, isLoading, isError };
}