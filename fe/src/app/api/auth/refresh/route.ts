import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          status: 'FAIL',
          message: '리프레시 토큰이 없습니다.',
          data: null,
        },
        { status: 401 },
      );
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(
      /\/$/,
      '',
    );
    const backendUrl = `${baseUrl}/api/auth/refresh`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.status !== 'SUCCESS') {
      const failResponse = NextResponse.json(
        {
          status: 'FAIL',
          message: data?.message || '토큰 재발급에 실패했습니다.',
          data: null,
        },
        { status: response.status || 401 },
      );

      failResponse.cookies.delete('accessToken');
      failResponse.cookies.delete('refreshToken');
      failResponse.cookies.delete('userName');

      return failResponse;
    }

    const { accessToken, refreshToken: nextRefreshToken, expiresIn } = data.data;

    const res = NextResponse.json({
      status: data.status,
      message: data.message,
      data: data.data,
    });

    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    });

    res.cookies.set('refreshToken', nextRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error) {
    console.error('Refresh Proxy Error:', error);

    const res = NextResponse.json(
      {
        status: 'ERROR',
        message: '토큰 재발급 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );

    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    res.cookies.delete('userName');

    return res;
  }
}
