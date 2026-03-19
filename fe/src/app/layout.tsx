import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';

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

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="ko" className={cn(pretendard.variable, 'font-sans')}>
      <body className="font-sans antialiased bg-mainbgcolor text-gray-900 h-screen overflow-hidden">
        <Header isLoggedIn={false} />
        <main className="w-full h-full pl-64 overflow-y-auto">{children}</main>
        {modal}
        <div id="modal-root" />
      </body>
    </html>
  );
}
