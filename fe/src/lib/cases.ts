import { cache } from 'react';
import { cookies } from 'next/headers';
import { isTokenExpired } from '@/lib/auth';
import { type CaseStatus } from '@/lib/constants/caseStatus';

export interface CaseListItem {
  caseNo: number;
  title: string;
  status: CaseStatus;
  stayStatus: string;
  claimType: string | null;
  sanctionType: string | null;
  sanctionDays: number | null;
  agencyName: string | null;
  createdAt: string;
}

interface CaseListResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: CaseListItem[] | null;
}

export const getCases = cache(async (): Promise<CaseListItem[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken || isTokenExpired(accessToken)) {
    return [];
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(
    /\/$/,
    '',
  );

  try {
    const response = await fetch(`${baseUrl}/api/cases`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const result = (await response.json().catch(() => null)) as CaseListResponse | null;
    if (result?.status !== 'SUCCESS' || !Array.isArray(result.data)) {
      return [];
    }

    return result.data.filter((item) => item.status !== 'STARTED');
  } catch (error) {
    console.error('Get Cases Error:', error);
    return [];
  }
});
