import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface TokenRefreshResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  } | null;
}

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
}

async function requestCurrentUser(accessToken: string) {
  return fetch(`${getBaseUrl()}/api/user/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
}

async function refreshTokens(refreshToken: string) {
  const response = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  const result = (await response.json().catch(() => null)) as TokenRefreshResponse | null;
  return { response, result };
}

function applyAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  });

  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('userName');
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        status: 'FAIL',
        message: '로그인이 필요합니다.',
        data: null,
      },
      { status: 401 },
    );
  }

  try {
    let userResponse = await requestCurrentUser(accessToken);

    if (userResponse.status === 401 && refreshToken) {
      const { response: refreshResponse, result: refreshResult } = await refreshTokens(refreshToken);

      if (refreshResponse.ok && refreshResult?.status === 'SUCCESS' && refreshResult.data) {
        userResponse = await requestCurrentUser(refreshResult.data.accessToken);

        const userResult = await userResponse.json().catch(() => ({}));
        const res = NextResponse.json(userResult, { status: userResponse.status });

        applyAuthCookies(
          res,
          refreshResult.data.accessToken,
          refreshResult.data.refreshToken,
          refreshResult.data.expiresIn,
        );

        if (userResult?.data?.userName) {
          res.cookies.set('userName', userResult.data.userName, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: refreshResult.data.expiresIn,
          });
        }

        return res;
      }
    }

    const result = await userResponse.json().catch(() => ({}));
    const res = NextResponse.json(result, { status: userResponse.status });

    if (!userResponse.ok) {
      clearAuthCookies(res);
      return res;
    }

    if (result?.data?.userName) {
      res.cookies.set('userName', result.data.userName, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('Current User Proxy Error:', error);

    const res = NextResponse.json(
      {
        status: 'ERROR',
        message: '사용자 정보를 불러오지 못했습니다.',
        data: null,
      },
      { status: 500 },
    );

    clearAuthCookies(res);
    return res;
  }
}
