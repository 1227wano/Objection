import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { cookies } from 'next/headers';
import { decodeJwt, isTokenExpired } from '@/lib/auth';

export const metadata: Metadata = {
  title: '이의있음!',
  description: '당신만을 위한 행정심판 보조 서비스',
  icons: {
    icon: '/favicon.svg',
  },
};

const pretendard = localFont({
  src: '../font/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-sans', // shadcn과 Tailwind가 기본 폰트로 인식할 수 있게 강제 지정합니다.
});

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const isLoggedIn = !!token && !isTokenExpired(token);
  // 로그인 응답에서 저장한 userName 쿠키 우선, 없으면 JWT 디코딩으로 폴백
  const userNameCookie = cookieStore.get('userName')?.value;
  const payload = token ? decodeJwt(token) : null;
  const userName = userNameCookie || payload?.userName || payload?.sub || payload?.userId || '사용자';

  return (
    <html lang="ko" className={cn(pretendard.variable, 'font-sans')}>
      <body className="font-sans antialiased bg-mainbgcolor text-gray-900 min-h-screen">
        <Header isLoggedIn={isLoggedIn} userName={userName} />
        <main className="w-full h-full overflow-y-auto">{children}</main>
        {modal}
        <div id="modal-root" />
      </body>
    </html>
  );
}
