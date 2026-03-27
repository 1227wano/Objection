'use client';

import { useState, useEffect } from 'react';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { apiClient } from '@/lib/api-client';

const CURRENT_CASE_KEY = 'currentCaseNo';
const CURRENT_GOV_DOC_KEY = 'currentGovDocNo';

interface GovDocumentData {
  summary: string | null;
}

interface GovDocumentResponse {
  status: string;
  message: string;
  data: GovDocumentData;
}

export default function RightSidebar() {
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const caseNo =
      window.sessionStorage.getItem(CURRENT_CASE_KEY) ||
      window.localStorage.getItem(CURRENT_CASE_KEY);
    const govDocNo =
      window.sessionStorage.getItem(CURRENT_GOV_DOC_KEY) ||
      window.localStorage.getItem(CURRENT_GOV_DOC_KEY);

    if (!caseNo || !govDocNo) return;

    apiClient
      .get<GovDocumentResponse>(`/cases/${caseNo}/gov-documents/${govDocNo}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => {});
  }, []);

  return (
    <RightSidebarFrame>
      <SidebarCard title="답변서 요약">
        <div className="text-gray-700 text-[14.5px] leading-relaxed whitespace-pre-wrap">
          {summary ?? '불러오는 중...'}
        </div>
      </SidebarCard>
    </RightSidebarFrame>
  );
}
