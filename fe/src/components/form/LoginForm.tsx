'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface LoginResponse {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userId: string;
    userName: string;
  } | null;
}

export default function LoginForm() {
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * [!] Next.js 16의 proxy.ts(미들웨어)에서
   * 이미 쿠키 존재 여부에 따른 페이지 리다이렉트를 처리하고 있습니다.
   * 클라이언트 사이드에서 추가적인 유저 정보를 가져오고 싶을 때만
   * 별도의 API(예: /api/auth/me) 호출이 필요합니다.
   */

  const handleLogin = async () => {
    if (!userId || !userPw) {
      setError('아이디와 패스워드를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        userId,
        userPw,
        isAutoLogin,
      });

      if (response.status === 'SUCCESS') {
        window.location.href = '/';
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      } else {
        setError('로그인 중 서버 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-2 pb-4">
      {/* 상단 로고 이미지 */}
      <div className="mb-4">
        <Image
          src="/logo.svg"
          alt="이의있음! 로고"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-8">로그인</h2>

      <form
        className="w-full space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">아이디</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디를 입력해 주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-first focus:border-transparent transition-colors text-sm"
          />
        </div>

        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">패스워드</label>
          <input
            type="password"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
            placeholder="패스워드를 입력해 주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-first focus:border-transparent transition-colors text-sm"
          />
        </div>

        {error && <div className="text-red-500 text-sm font-medium mt-1">{error}</div>}

        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            id="auto-login"
            checked={isAutoLogin}
            onChange={(e) => setIsAutoLogin(e.target.checked)}
            className="w-4 h-4 text-first border-gray-300 rounded focus:ring-first"
          />
          <label
            htmlFor="auto-login"
            className="ml-2 text-sm text-gray-700 font-medium cursor-pointer"
          >
            자동 로그인
          </label>
        </div>

        <div className="w-full flex flex-col mt-8 space-y-3">
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-first hover:bg-first/80"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            취소
          </Button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-600 flex justify-center gap-2">
        <span>아직 계정이 없으신가요?</span>
        <Link href="/regist" className="font-semibold text-first hover:underline" replace>
          회원가입
        </Link>
      </div>
    </div>
  );
}
