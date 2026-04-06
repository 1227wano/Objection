'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface LoginResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: null;
}

export default function LoginForm() {
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!userId.trim() || !userPw.trim()) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<LoginResponse>(
        '/auth/login',
        {
          userId: userId.trim(),
          userPw,
          isAutoLogin,
        },
        { skipRefresh: true },
      );

      if (response.status === 'SUCCESS') {
        window.location.href = '/';
        return;
      }

      setError(response.message || '아이디 또는 비밀번호를 다시 확인해 주세요.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
      } else {
        setError('로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pb-4 pt-2">
      <div className="mb-4">
        <Image src="/logo.svg" alt="이의있음! 로고" width={80} height={80} className="object-contain" />
      </div>

      <h2 className="mb-8 text-xl font-bold text-gray-900">로그인</h2>

      <form
        className="w-full space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleLogin();
        }}
      >
        <div className="w-full space-y-2 text-left">
          <label className="block text-sm font-semibold text-gray-700">아이디</label>
          <input
            type="text"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="아이디를 입력해 주세요."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-first"
          />
        </div>

        <div className="w-full space-y-2 text-left">
          <label className="block text-sm font-semibold text-gray-700">비밀번호</label>
          <input
            type="password"
            value={userPw}
            onChange={(event) => setUserPw(event.target.value)}
            placeholder="비밀번호를 입력해 주세요."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-first"
          />
        </div>

        {error && <div className="mt-1 text-sm font-medium text-red-500">{error}</div>}

        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            id="auto-login"
            checked={isAutoLogin}
            onChange={(event) => setIsAutoLogin(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-first focus:ring-first"
          />
          <label htmlFor="auto-login" className="ml-2 cursor-pointer text-sm font-medium text-gray-700">
            자동 로그인
          </label>
        </div>

        <div className="mt-8 flex w-full flex-col space-y-3">
          <Button
            type="submit"
            className="h-12 w-full bg-first text-base font-semibold hover:bg-first/80"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full border border-gray-300 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            뒤로가기
          </Button>
        </div>
      </form>

      <div className="mt-6 flex justify-center gap-2 text-sm text-gray-600">
        <span>아직 계정이 없으신가요?</span>
        <Link href="/regist" className="font-semibold text-first hover:underline" replace>
          회원가입
        </Link>
      </div>
    </div>
  );
}
