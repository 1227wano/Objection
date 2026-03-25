import { cache } from 'react';
import { cookies } from 'next/headers';
import { isTokenExpired } from '@/lib/auth';

export interface CurrentUser {
  userNo: number;
  userId: string;
  userName: string;
}

interface CurrentUserResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: CurrentUser | null;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken || isTokenExpired(accessToken)) {
    return null;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(
    /\/$/,
    '',
  );

  try {
    const response = await fetch(`${baseUrl}/api/user/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json().catch(() => null)) as CurrentUserResponse | null;
    if (result?.status !== 'SUCCESS') {
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Get Current User Error:', error);
    return null;
  }
});
