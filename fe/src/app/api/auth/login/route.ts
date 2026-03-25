import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface LoginResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    userName?: string;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userPw, isAutoLogin } = body;

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(
      /\/$/,
      '',
    );
    const backendUrl = `${baseUrl}/api/auth/login`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userPw }),
    });

    const data = (await response.json().catch(() => null)) as LoginResponse | null;

    if (!response.ok || data?.status !== 'SUCCESS' || !data.data) {
      const isCredentialError = response.status === 400 || response.status === 401;

      return NextResponse.json(
        {
          status: 'FAIL',
          message:
            data?.message ||
            (isCredentialError
              ? '아이디 또는 비밀번호를 다시 확인해 주세요.'
              : '로그인 처리 중 문제가 발생했습니다.'),
          data: null,
        },
        { status: response.status || 500 },
      );
    }

    const { accessToken, refreshToken, expiresIn, userName } = data.data;
    const maxAge = isAutoLogin ? 60 * 60 * 24 * 30 : expiresIn;

    const res = NextResponse.json({
      status: 'SUCCESS',
      message: data.message,
      data: null,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    };

    res.cookies.set('accessToken', accessToken, cookieOptions);
    res.cookies.set('refreshToken', refreshToken, cookieOptions);

    if (userName) {
      res.cookies.set('userName', userName, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge,
      });
    }

    return res;
  } catch (error) {
    console.error('Login Proxy Error:', error);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: '로그인 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        data: null,
      },
      { status: 500 },
    );
  }
}
