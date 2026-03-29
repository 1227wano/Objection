'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { SidebarCard } from '@/components/ui/SidebarCard';
import { apiClient } from '@/lib/api-client';

interface GovDocumentData {
  summary: string | null;
}

interface GovDocumentResponse {
  status: string;
  message: string;
  data: GovDocumentData;
}

export default function RightSidebar() {
  const { caseNo } = useParams<{ caseNo: string }>();
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    const govDocNo =
      window.sessionStorage.getItem(`govDocNo_${caseNo}_ANSWER`) ||
      window.localStorage.getItem(`govDocNo_${caseNo}_ANSWER`);

    if (!caseNo || !govDocNo) return;

    apiClient
      .get<GovDocumentResponse>(`/cases/${caseNo}/gov-documents/${govDocNo}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => {});
  }, [caseNo]);

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
