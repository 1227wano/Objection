import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 로그인 프록시 API
 * 프론트엔드 -> Next.js API Route -> 실제 백엔드
 * 백엔드에서 받은 토큰을 httpOnly 쿠키로 변환하여 응답합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userPw, isAutoLogin } = body;

    // URL 조립 시 발생할 수 있는 슬래시 중복 문제 해결
    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://j14a102.p.ssafy.io:8080').replace(/\/$/, '');
    const backendUrl = `${baseUrl}/api/auth/login`;

    // 1. 실제 백엔드 서버로 로그인 요청
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userPw }),
    });

    const data = await response.json().catch(() => ({}));

    // 2. 로그인 실패 처리
    if (!response.ok || data.status !== 'SUCCESS') {
      return NextResponse.json(
        { status: 'FAIL', message: data.message || '로그인에 실패했습니다.' },
        { status: response.status }
      );
    }

    // 3. 로그인 성공 시 httpOnly 쿠키 설정
    const { accessToken, refreshToken, expiresIn, userName } = data.data;
    
    const res = NextResponse.json({
      status: 'SUCCESS',
      message: data.message,
    });

    // 만료 시간: 자동 로그인 시 30일, 아니면 백엔드 expiresIn(초) 그대로 사용
    const maxAge = isAutoLogin ? 60 * 60 * 24 * 30 : expiresIn;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    };

    res.cookies.set('accessToken', accessToken, cookieOptions);
    res.cookies.set('refreshToken', refreshToken, cookieOptions);

    // userName을 별도 쿠키로 저장 (서버/클라이언트 모두 읽을 수 있도록 httpOnly: false)
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
      { status: 'ERROR', message: '서버 연결 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
