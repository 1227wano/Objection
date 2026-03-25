import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 로그아웃 프록시 API
 * 백엔드에 로그아웃 요청 후 httpOnly 쿠키를 삭제합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(
      /\/$/,
      '',
    );
    const backendUrl = `${baseUrl}/api/auth/logout`;

    // 백엔드 로그아웃 요청
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    // 쿠키 삭제 (백엔드 응답과 관계없이 항상 삭제)
    const res = NextResponse.json({
      status: data.status || 'SUCCESS',
      message: data.message || '로그아웃 되었습니다.',
    });

    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    res.cookies.delete('userName');

    return res;
  } catch (error) {
    console.error('Logout Proxy Error:', error);

    // 에러가 나더라도 쿠키는 삭제
    const res = NextResponse.json(
      { status: 'ERROR', message: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 },
    );
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    res.cookies.delete('userName');

    return res;
  }
}
