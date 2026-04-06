'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function MyPageForm() {
  const router = useRouter();

  // 현재 사용자 정보 (실제 구현 시 API에서 가져와야 함)
  const [formData, setFormData] = useState({
    name: '홍길동', // mock 데이터
    email: 'hong@example.com', // mock 데이터
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleUpdate = async () => {
    // 에러 상태 초기화
    setErrors({ password: '', confirmPassword: '' });

    // 1. 패스워드 빈칸 및 길이 확인
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: '새로운 패스워드가 비어 있습니다.' }));
      return;
    }
    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: '패스워드는 8글자 이상이어야 합니다.' }));
      return;
    }

    // 2. 패스워드 확인 빈칸 및 일치 여부 확인
    if (!formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '패스워드 확인칸이 비어 있습니다.' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '패스워드가 서로 일치하지 않습니다.' }));
      return;
    }

    setIsLoading(true);
    
    // 실제 API 연동 시뮬레이션
    setTimeout(() => {
        alert('회원 정보가 성공적으로 수정되었습니다.');
        setIsLoading(false);
        router.back(); // 모달 닫기
    }, 1000);
  };

  // Helper 함수: 에러 여부에 따라 input 테두리/포커스 색상 반환
  const getInputClassName = (errorMsg: string, isReadOnly: boolean = false) => {
    const baseClass =
      'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm';
    
    if (isReadOnly) {
        return `${baseClass} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`;
    }
    if (errorMsg) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-first`;
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

      <h2 className="text-xl font-bold text-gray-900 mb-2">회원 수정</h2>
      <p className="text-sm text-gray-500 mb-6">회원 정보를 확인하고 수정할 수 있습니다</p>

      <div className="w-full grid grid-cols-1 [@media_screen_and_(max-height:850px)]:sm:grid-cols-2 gap-x-4 gap-y-5">
        {/* 이름 (수정 불가) */}
        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            disabled
            className={getInputClassName('', true)}
          />
        </div>

        {/* 아이디/이메일 (수정 불가) */}
        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">아이디 (이메일)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className={getInputClassName('', true)}
          />
        </div>

        {/* 새로운 패스워드 */}
        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">새로운 패스워드</label>
          <div className="flex flex-col h-full">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="새로운 패스워드를 입력해주세요"
              className={getInputClassName(errors.password)}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-2 ml-1">{errors.password}</p>
            )}
          </div>
        </div>

        {/* 패스워드 확인 */}
        <div className="space-y-2 text-left w-full">
          <label className="block text-sm font-semibold text-gray-700">패스워드 확인</label>
          <div className="flex flex-col h-full">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="패스워드를 한번 더 입력해 주세요"
              className={getInputClassName(errors.confirmPassword)}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-2 ml-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col mt-8 space-y-3">
        <Button
          className="w-full h-12 text-base font-semibold bg-first hover:bg-first/80"
          onClick={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? '수정 중...' : '수정하기'}
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => router.back()}
        >
          취소
        </Button>
      </div>

      {/* 회원 탈퇴 */}
      <button
        type="button"
        className="mt-6 text-sm text-gray-400 hover:text-red-500 underline underline-offset-4 transition-colors"
        onClick={() => {
          if (confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            alert('회원 탈퇴가 완료되었습니다.');
            window.location.href = '/';
          }
        }}
      >
        회원 탈퇴
      </button>
    </div>
  );
}
