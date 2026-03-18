import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";

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
  variable: '--font-pretendard',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <body className="font-pretendard antialiased bg-[#F3F4F6] text-gray-900 min-h-screen">
        <Header isLoggedIn={false} />
        <main className="w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
