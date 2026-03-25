import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userPw, userName } = body;

    const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080').replace(
      /\/$/,
      '',
    );
    const backendUrl = `${baseUrl}/api/auth/signup`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, userPw, userName }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.status) {
      return NextResponse.json(
        {
          status: 'FAIL',
          message: data?.message || '회원가입 요청 처리에 실패했습니다.',
          data: null,
        },
        { status: response.status || 500 },
      );
    }

    return NextResponse.json(
      {
        status: data.status,
        message: data.message,
        data: data.data ?? null,
      },
      { status: response.status },
    );
  } catch (error) {
    console.error('Signup Proxy Error:', error);

    return NextResponse.json(
      {
        status: 'ERROR',
        message: '회원가입 중 오류가 발생했습니다.',
        data: null,
      },
      { status: 500 },
    );
  }
}
