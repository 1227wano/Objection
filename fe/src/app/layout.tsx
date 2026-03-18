import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "이의있음!",
  description: "당신만을 위한 행정심판 보조 서비스",
  icons: {
    icon: "/favicon.svg",
  },
};

const pretendard = localFont({
  src: '../font/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-sans', // shadcn과 Tailwind가 기본 폰트로 인식할 수 있게 강제 지정합니다.
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // cn과 font-sans 클래스를 결합하여 하위 모든 컴포넌트들에 Pretendard를 상속시킵니다.
    <html lang="ko" className={cn(pretendard.variable, "font-sans")}>
      <body className="font-sans antialiased bg-[#F3F4F6] text-gray-900 min-h-screen">
        <Header isLoggedIn={false} />
        <main className="w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
