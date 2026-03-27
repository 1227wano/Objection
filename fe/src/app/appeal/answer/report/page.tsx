'use client';

import { useState, useEffect } from 'react';
import SectionHeader from '../../_components/SectionHeader';
import RespondentSummary from './_components/RespondentSummary';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import LoadingSpinner from '../../_components/LoadingSpinner';

const CURRENT_CASE_KEY = 'currentCaseNo';
const CURRENT_GOV_DOC_KEY = 'currentGovDocNo';

function resolveCaseNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_CASE_KEY) || window.localStorage.getItem(CURRENT_CASE_KEY)
  );
}

function resolveGovDocNo(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    window.sessionStorage.getItem(CURRENT_GOV_DOC_KEY) ||
    window.localStorage.getItem(CURRENT_GOV_DOC_KEY)
  );
}

interface GovDocumentData {
  govDocNo: number;
  documentType: string;
  extractedText: string | null;
  parsedJson: string | null;
  summary: string | null;
  fact: string | null;
  opinion: string | null;
}

interface GovDocumentResponse {
  status: string;
  message: string;
  data: GovDocumentData;
}

export default function RebuttalAnalysisPage() {
  const [data, setData] = useState<GovDocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const caseNo = resolveCaseNo();
    const govDocNo = resolveGovDocNo();

    if (!caseNo || !govDocNo) {
      setError('사건 번호 또는 문서 번호를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    apiClient
      .get<GovDocumentResponse>(`/cases/${caseNo}/gov-documents/${govDocNo}`)
      .then((res) => setData(res.data))
      .catch(() => setError('답변서 분석 결과를 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col p-4 py-12 md:py-16 animate-in fade-in duration-500">
      <div className="w-full flex flex-col gap-8">
        <SectionHeader title="답변서 요약 결과" />

        {data.summary && <RespondentSummary summary={data.summary} />}

        <div className="flex items-center justify-end pt-8">
          <Button asChild>
            <Link href="/appeal/supplement/case">다음 단계로</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
