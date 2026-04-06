import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { getCurrentUser } from '@/lib/current-user';

export const metadata: Metadata = {
  title: '이의있음!',
  description: '행정심판 진행을 쉽게 돕는 온라인 행정심판 지원 서비스',
  icons: {
    icon: '/favicon.svg',
  },
};

const pretendard = localFont({
  src: '../font/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-sans',
});

export default async function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  const isLoggedIn = !!currentUser;
  const userName = currentUser?.userName || '사용자';

  return (
    <html lang="ko" className={cn(pretendard.variable, 'font-sans')}>
      <body className="min-h-screen bg-mainbgcolor font-sans text-gray-900 antialiased">
        <Header isLoggedIn={isLoggedIn} userName={userName} />
        <main className="h-full w-full overflow-y-auto">{children}</main>
        {modal}
        <div id="modal-root" />
      </body>
    </html>
  );
}
