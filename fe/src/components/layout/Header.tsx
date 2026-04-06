'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
}

interface CurrentUserResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    userNo: number;
    userId: string;
    userName: string;
  } | null;
}

export default function Header({ isLoggedIn = false, userName = '사용자' }: HeaderProps) {
  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    setDisplayName(userName);
  }, [userName]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    const syncCurrentUser = async () => {
      try {
        const response = await apiClient.get<CurrentUserResponse>('/user/me');
        if (isMounted && response.status === 'SUCCESS' && response.data?.userName) {
          setDisplayName(response.data.userName);
        }
      } catch (error) {
        console.error('Current user sync error:', error);
      }
    };

    void syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-mainbgcolor px-6 transition-colors duration-200">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="이의있음! 로고" width={32} height={32} className="object-contain" />
        <span className="text-lg font-bold tracking-tight text-first">이의있음! (Objection!)</span>
      </Link>

      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="mr-2 font-medium text-first">{displayName}님, 환영합니다!</span>
            <Link href="/mypage">
              <Button
                variant="outline"
                className="h-9 border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                마이페이지
              </Button>
            </Link>
            <Button
              className="h-9 bg-first px-4 text-sm font-medium text-white hover:bg-first/80"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        ) : (
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
