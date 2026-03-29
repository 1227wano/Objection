import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge Runtime 미들웨어를 우회하기 위한 Node.js API Route.
 * 문서 생성 API는 응답이 오래 걸려 Edge Runtime의 짧은 타임아웃으로
 * ECONNRESET(socket hang up)이 발생하므로 여기서 직접 fetch한다.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ analysisNo: string }> }
) {
  const { analysisNo } = await params;
  const token = request.cookies.get('accessToken')?.value;
  const body = await request.json();
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://j14a102.p.ssafy.io:8080'
  ).replace(/\/$/, '');

  const res = await fetch(`${baseUrl}/api/analysis/${analysisNo}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
