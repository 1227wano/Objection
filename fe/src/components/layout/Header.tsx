'use client';

import Link from 'next/link'; // Next.js의 내장 링크 컴포넌트입니다. <a> 태그보다 페이지 전환 성능이 뛰어납니다.
import Image from 'next/image'; // Next.js의 내장 이미지 컴포넌트입니다. 이미지 크기와 로딩 속도를 자동으로 최적화해줍니다.
import { Button } from '@/components/ui/button'; // shadcn/ui 버튼 컴포넌트를 가져옵니다.

// Header 컴포넌트가 받을 옵션(Prop)의 타입을 지정합니다.
// TypeScript의 장점이며, 아래와 같이 정해둔 변수만 받을 수 있도록 강제하여 버그를 줄입니다.
interface HeaderProps {
  isLoggedIn?: boolean; // 로그인 상태 여부 (true면 로그인, false면 비로그인)
  userName?: string; // 로그인한 사용자의 이름
}

// export default: 이 파일(Header.tsx)을 가져다 쓸 때 Header가 기본적으로 제공되도록 합니다.
export default function Header({ isLoggedIn = false, userName = 'OOO' }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.href = '/';
  };

  return (
    // <header>: HTML의 구조적 의미(시맨틱)를 더해주는 태그입니다.
    // 전체 페이지에서 동일하게 하얀/투명한 배경과 연한 구분선을 유지하며 상단에 고정(sticky)됩니다.
    <header className="sticky top-0 z-50 w-full h-14 px-6 flex justify-between items-center border-b border-gray-200 bg-mainbgcolor transition-colors duration-200">
      {/* 1. 좌측 로고 영역 */}
      {/* href="/" : 로고를 클릭하면 프로젝트의 메인 페이지로 이동합니다. */}
      <Link href="/" className="flex items-center gap-2">
        {/* /logo.svg 파일은 public 폴더에 위치해야 브라우저가 찾을 수 있습니다. */}
        <Image
          src="/logo.svg"
          alt="이의있음! 로고"
          width={32}
          height={32}
          className="object-contain" // 이미지가 컨테이너를 벗어나지 않고 잘리지 않도록 맞춥니다.
        />
        <span className="text-lg font-bold text-first tracking-tight">이의있음! (Objection!)</span>
      </Link>

      {/* 2. 우측 버튼/프로필 영역 */}
      <div className="flex items-center gap-2">
        {/*
          [조건부 렌더링]: isLoggedIn이 true이냐 false이냐에 따라 다른 화면을 보여줍니다.
          물음표(?)와 콜론(:)을 사용하는 삼항 연산자 구조입니다.
        */}
        {isLoggedIn ? (
          // === 로그인 상태일 때 (true) ===
          <div className="flex items-center gap-2">
            <span className="text-first font-medium mr-2">{userName}님, 환영합니다!</span>
            <Link href="/mypage">
              <Button
                variant="outline"
                className="h-9 px-4 text-sm font-medium border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                회원수정
              </Button>
            </Link>
            <Button
              className="h-9 px-4 text-sm font-medium bg-first text-white hover:bg-first/80"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          // === 비로그인 상태일 때 (false) ===
          <>
            <Link href="/login">
              <Button size="m">로그인</Button>
            </Link>
            <Link href="/regist">
              <Button variant="outline" size="m">
                회원가입
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
