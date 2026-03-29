'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { apiClient } from '@/lib/api-client';

const CURRENT_DECISION_DOC_KEY = 'currentDecisionGovDocNo';
const CURRENT_ANALYSIS_KEY = 'currentAnalysisNo';

interface GovDocumentResponse {
  status: string;
  message: string;
  data: {
    summary: string | null;
  };
}

interface AnalysisResponse {
  status: string;
  message: string;
  data: {
    precedentResult: {
      strategySummary: string;
    } | null;
  } | null;
}

export default function RightSidebar() {
  const { caseNo } = useParams<{ caseNo: string }>();
  const [summary, setSummary] = useState<string | null>(null);
  const [strategySummary, setStrategySummary] = useState<string | null>(null);

  useEffect(() => {
    const govDocNo =
      window.sessionStorage.getItem(CURRENT_DECISION_DOC_KEY) ||
      window.localStorage.getItem(CURRENT_DECISION_DOC_KEY);

    if (caseNo && govDocNo) {
      apiClient
        .get<GovDocumentResponse>(`/cases/${caseNo}/gov-documents/${govDocNo}`)
        .then((res) => setSummary(res.data.summary))
        .catch(() => {});
    }

    const analysisNo =
      window.sessionStorage.getItem(CURRENT_ANALYSIS_KEY) ||
      window.localStorage.getItem(CURRENT_ANALYSIS_KEY);

    if (analysisNo) {
      apiClient
        .get<AnalysisResponse>(`/analysis/${analysisNo}`)
        .then((res) => setStrategySummary(res.data?.precedentResult?.strategySummary ?? null))
        .catch(() => {});
    }
  }, [caseNo]);

  return (
    <RightSidebarFrame>
      <SidebarCard title="보충서면 대응 전략">
        <div className="text-gray-700 text-[14.5px] leading-relaxed whitespace-pre-wrap">
          {strategySummary ?? '불러오는 중...'}
        </div>
      </SidebarCard>
    </RightSidebarFrame>
  );
}
