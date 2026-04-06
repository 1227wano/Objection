'use client';

import { useState, useEffect } from 'react';
import type { CaseApiResponse, AnalysisData, Eligibility } from '../_types/analysis';
import { apiClient } from '@/lib/api-client';

function resolveGovDocNo(caseNo: string, documentType: string): string | null {
  const key = `govDocNo_${caseNo}_${documentType}`;
  return window.sessionStorage.getItem(key) || window.localStorage.getItem(key);
}

/**
 * 처분일(disposalDate) 기준 90일 뒤를 deadline으로 산출
 */
function calcDeadline(disposalDate: string): string {
  const d = new Date(disposalDate);
  d.setDate(d.getDate() + 90);
  return d.toISOString().split('T')[0];
}

/**
 * API 응답 데이터를 기반으로 적격성(eligibility) 판단
 * 1. 청구인 적격: isDirect === true → pass
 * 2. 청구기한 적격: deadline이 아직 안 지남 → pass
 */
function buildEligibility(isDirect: boolean | null, disposalDate: string | null): Eligibility[] {
  // 1) 청구인 적격
  const claimantEligibility: Eligibility = {
    id: 1,
    title: '청구인 적격',
    status: isDirect === true ? 'pass' : 'fail',
    description:
      isDirect === true
        ? '처분의 직접 상대방으로서 청구인 자격이 충분합니다.'
        : '본인에 대한 처분이 아니므로 청구인 자격을 확인해야 합니다.',
  };

  // 2) 청구기한 적격
  let deadlineEligibility: Eligibility;

  if (!disposalDate) {
    deadlineEligibility = {
      id: 2,
      title: '청구기한 적격',
      status: 'warning',
      description: '처분일자를 확인할 수 없어 기한 판단이 어렵습니다.',
    };
  } else {
    const deadline = new Date(calcDeadline(disposalDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      deadlineEligibility = {
        id: 2,
        title: '청구기한 적격',
        status: 'fail',
        description: `청구 기한이 ${Math.abs(diffDays)}일 경과하여 행정심판 청구가 어렵습니다.`,
      };
    } else if (diffDays <= 15) {
      deadlineEligibility = {
        id: 2,
        title: '청구기한 적격',
        status: 'warning',
        description: `청구 기한까지 ${diffDays}일 남았습니다. 서둘러 준비하세요.`,
      };
    } else {
      deadlineEligibility = {
        id: 2,
        title: '청구기한 적격',
        status: 'pass',
        description: `청구 기한까지 ${diffDays}일 남아 있어 충분한 시간이 있습니다.`,
      };
    }
  }

  return [claimantEligibility, deadlineEligibility];
}

export function useNoticeAnalysis(caseNo: string) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);

        if (!caseNo) {
          throw new Error('사건 번호를 찾을 수 없습니다.');
        }

        const govDocNo = resolveGovDocNo(caseNo, 'NOTICE');

        const res = await fetch(`/api/cases/${caseNo}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json: CaseApiResponse = await res.json();

        if (json.status !== 'SUCCESS') {
          throw new Error(json.message);
        }

        const { data } = json;
        console.log(data);
        // 처분서 summary 조회
        let summary = '';
        if (govDocNo) {
          const docRes = await apiClient
            .get<{
              status: string;
              data: { summary: string | null };
            }>(`/cases/${caseNo}/gov-documents/${govDocNo}`)
            .catch(() => null);
          summary = docRes?.data?.summary ?? '';
        }
        // 적격성 판단 (프론트 로직)
        const eligibility = buildEligibility(data.isDirect, data.disposalDate);

        // deadline 계산
        const deadline = data.disposalDate ? calcDeadline(data.disposalDate) : '';

        // details 매핑 (nullable 필드 필터링)
        const detailEntries: { label: string; value: string | null | undefined }[] = [
          { label: '처분유형', value: data.sanctionType },
          { label: '처분일수', value: data.sanctionDays != null ? `${data.sanctionDays}일` : null },
          { label: '처분기관', value: data.agencyName },
          { label: '위반유형', value: data.violationType },
          { label: '사업체명', value: data.businessName },
          { label: '사업체 주소', value: data.businessAddress },
          { label: '청구인', value: data.claimant },
        ];

        const details = detailEntries
          .filter((d): d is { label: string; value: string } => d.value != null)
          .map(({ label, value }) => ({ label, value }));

        setAnalysisData({
          summary,
          originalText: '',
          deadline,
          eligibility,
          details,
        });
      } catch (error) {
        console.error('분석 데이터 조회 실패:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [caseNo]);

  return { analysisData, isLoading, isError };
}
