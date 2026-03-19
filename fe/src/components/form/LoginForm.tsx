'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
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

      <div className="w-full space-y-5">
        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">아이디</label>
          <input
            type="text"
            placeholder="아이디를 입력해 주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-first focus:border-transparent transition-colors text-sm"
          />
        </div>

        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">패스워드</label>
          <input
            type="password"
            placeholder="패스워드를 입력해 주세요"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-first focus:border-transparent transition-colors text-sm"
          />
        </div>

        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            id="auto-login"
            className="w-4 h-4 text-first border-gray-300 rounded focus:ring-first"
          />
          <label
            htmlFor="auto-login"
            className="ml-2 text-sm text-gray-700 font-medium cursor-pointer"
          >
            자동 로그인
          </label>
        </div>
      </div>

      <div className="w-full flex flex-col mt-8 space-y-3">
        <Button
          className="w-full h-12 text-base font-semibold bg-first hover:bg-first/80"
          onClick={() => {}}
        >
          로그인
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => window.history.back()}
        >
          취소
        </Button>
      </div>

      <div className="mt-6 text-sm text-gray-600 flex justify-center gap-2">
        <span>아직 계정이 없으신가요?</span>
        <Link href="/regist" className="font-semibold text-first hover:underline" replace>
          회원가입
        </Link>
      </div>
    </div>
  );
}
