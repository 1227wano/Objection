'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Evidence, EvidenceResponse } from '../_types/evidence';


export function useEvidence(analysisNo: number) {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // 데이터 조회 함수
  const fetchEvidence = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<EvidenceResponse>(`/analysis/${analysisNo}/evidence`);
      if (res.status === 'SUCCESS') {
        setEvidences(res.data);
      }
    } catch (e) {
      console.error(e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [analysisNo]);

  useEffect(() => {
    if (analysisNo) {
      fetchEvidence();
    }
  }, [analysisNo, fetchEvidence]);

  // 일괄 업데이트 함수
  const updateEvidences = async (pendingChanges: Record<number, boolean>) => {
    const changedIds = Object.keys(pendingChanges);
    if (changedIds.length === 0) return true; // 변경 사항이 없으면 바로 성공 처리

    try {
      const updatePromises = changedIds.map((id) =>
        apiClient.patch(`/analysis/${analysisNo}/evidence/${id}`, {
          submitted: pendingChanges[Number(id)],
        }),
      );

      await Promise.all(updatePromises);
      return true;
    } catch (error) {
      console.error('업데이트 실패:', error);
      return false;
    }
  };

  return { evidences, isLoading, isError, updateEvidences };
}
