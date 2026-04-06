import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenExpired } from '@/lib/auth';

/**
 * 프록시: 모든 페이지 요청 전에 실행됩니다.
 * 쿠키 기반 인증을 처리하여 리다이렉트 및 헤더 조립을 구현합니다.
 */
export default function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // 토큰 유효성 검사 (존재 여부 + 만료 여부)
  const isValidToken = token && !isTokenExpired(token);

  // 1. 공용 API 및 경로 정의
  const publicRoutes = ['/login', '/regist', '/'];
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/email/send',
    '/api/auth/email/verify',
    '/api/auth/refresh',
    '/api/auth/logout',
  ];
  
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApiRoute = publicApiRoutes.includes(pathname);
  const isApiRoute = pathname.startsWith('/api/');

  // 2. API 요청 프록시 처리
  if (isApiRoute) {
    // 보호된 API 요청인데 토큰이 없는 경우 -> 401 JSON 반환 (리다이렉트 X)
    if (!isPublicApiRoute && !isValidToken) {
      return NextResponse.json(
        { status: 'FAIL', message: '인증이 필요한 서비스입니다.' },
        { status: 401 }
      );
    }

    // 그 외(Next.js API Route에서 처리하는 경로 제외) 백엔드 프록시 (Rewrite)
    const nextApiRoutes = [
      '/api/auth/login',
      '/api/auth/signup',
      '/api/auth/email/send',
      '/api/auth/email/verify',
      '/api/auth/refresh',
      '/api/auth/logout',
      '/api/user/me',
    ];

    // /api/analysis/.../documents POST 는 route.ts(Node.js)가 직접 처리 → rewrite 제외
    // GET 등 다른 메소드는 기존 rewrite 로 백엔드 통과
    const isAnalysisDocuments =
      request.method === 'POST' &&
      pathname.startsWith('/api/analysis/') &&
      pathname.endsWith('/documents');

    if (!nextApiRoutes.includes(pathname) && !isAnalysisDocuments) {

      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://j14a102.p.ssafy.io:8080').replace(/\/$/, '');
      const backendUrl = new URL(request.nextUrl.pathname, `${baseUrl}/`);
      
      backendUrl.search = request.nextUrl.search;

      const requestHeaders = new Headers(request.headers);
      if (isValidToken) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }

      return NextResponse.rewrite(backendUrl, {
        request: { headers: requestHeaders },
      });
    }
    
    // Next.js API Route(route.ts)에서 처리하도록 통과
    return NextResponse.next();
  }

  // 3. 이미 로그인된 사용자가 로그인/회원가입 페이지에 접근할 경우 -> 홈으로 이동
  if (isValidToken && (pathname === '/login' || pathname === '/regist')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. 로그인하지 않았거나 토큰이 만료된 사용자가 공용 경로가 아닌 곳에 접근할 경우 -> 로그인으로 이동
  if (!isValidToken && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) {
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
    }
    return response;
  }

  return NextResponse.next();
}

/**
 * 미들웨어가 실행될 경로 설정
 */
export const config = {
  matcher: [
    /*
     * 모든 요청 경로에 미들웨어 적용 (정적 파일 제외)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
