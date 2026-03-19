'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function RegistForm() {
  const router = useRouter();

  // 폼 진행 단계 (1: 정보 입력, 2: 이메일 인증)
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 6자리 인증 코드 상태
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    // 에러 상태 초기화
    setErrors({ name: '', email: '', password: '', confirmPassword: '' });

    // 1. 이름 빈칸 확인
    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: '이름이 비어 있습니다. 이름을 입력해 주세요.' }));
      return;
    }

    // 2. 이메일 빈칸 및 형식 확인
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: '이메일(아이디)이 비어 있습니다.' }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: '올바른 이메일 양식이 아닙니다.' }));
      return;
    }

    // 3. 패스워드 빈칸 및 길이 확인
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: '패스워드가 비어 있습니다.' }));
      return;
    }
    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: '패스워드는 8글자 이상이어야 합니다.' }));
      return;
    }

    // 4. 패스워드 확인 빈칸 및 일치 여부 확인
    if (!formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '패스워드 확인칸이 비어 있습니다.' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '패스워드가 서로 일치하지 않습니다.' }));
      return;
    }

    // 검증 통과 시 인증 번호 발송 API 호출 (실제 구현 시)
    // alert('해당 이메일로 인증 코드가 발송되었습니다!');

    // 단계 넘어가기
    setStep(2);
  };

  const handleFinalRegist = () => {
    const codeString = authCode.join('');
    if (codeString.length !== 6) {
      alert('6자리 인증 코드를 모두 입력해 주세요.');
      return;
    }

    // 실제 회원가입 API 연동 위치
    alert('이메일 인증 성공! 회원가입이 완료되었습니다.');
    router.push('/login'); // 완료 후 로그인 페이지로 이동
  };

  const handleCodeChange = (index: number, value: string) => {
    // 숫자만 입력 허용
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...authCode];
    newCode[index] = value;
    setAuthCode(newCode);

    // 다음 칸으로 자동 포커스 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스 키를 눌렀을 때, 현재 칸이 비어있으면 이전 칸으로 포커스 이동
    if (e.key === 'Backspace' && !authCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Helper 함수: 에러 여부에 따라 input 테두리/포커스 색상 반환
  const getInputClassName = (errorMsg: string) => {
    const baseClass =
      'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm';
    if (errorMsg) {
      return `${baseClass} border-red-500 focus:ring-red-500`; // 에러 스타일
    }
    return `${baseClass} border-gray-300 focus:ring-first`; // 정상 스타일
  };

  return (
    <div className="flex flex-col items-center pt-2 pb-4">
      {/* 상단 로고 이미지 (공통) */}
      <div className="mb-4">
        <Image
          src="/logo.svg"
          alt="이의있음! 로고"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">회원가입</h2>
      <p className="text-sm text-gray-500 mb-6">회원가입 후 서비스를 이용해 주세요</p>

      {/* 단계별 렌더링 */}
      {step === 1 && (
        <>
          <div className="w-full grid grid-cols-1 [@media_screen_and_(max-height:850px)]:sm:grid-cols-2 gap-x-4 gap-y-5">
            {/* 이름 */}
            <div className="space-y-2 text-left w-full">
              <label className="block text-sm font-semibold text-gray-700">
                이름<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex flex-col h-full">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="실명으로 가입해주세요"
                  className={getInputClassName(errors.name)}
                />
                {errors.name && <p className="text-xs text-red-500 mt-2 ml-1">{errors.name}</p>}
              </div>
            </div>

            {/* 아이디 (이메일) */}
            <div className="space-y-2 text-left w-full">
              <label className="block text-sm font-semibold text-gray-700">
                아이디 (이메일)<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex flex-col h-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력하세요"
                  className={getInputClassName(errors.email)}
                />
                {errors.email && <p className="text-xs text-red-500 mt-2 ml-1">{errors.email}</p>}
              </div>
            </div>

            {/* 패스워드 */}
            <div className="space-y-2 text-left w-full">
              <label className="block text-sm font-semibold text-gray-700">
                패스워드<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex flex-col h-full">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="패스워드는 8자 이상으로 해주세요"
                  className={getInputClassName(errors.password)}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-2 ml-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* 패스워드 확인 */}
            <div className="space-y-2 text-left w-full">
              <label className="block text-sm font-semibold text-gray-700">
                패스워드 확인<span className="text-red-500 ml-0.5">*</span>
              </label>
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
              onClick={handleNextStep}
            >
              다음 (이메일 인증)
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => router.back()}
            >
              취소
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="w-full flex-col flex items-center">
          <div className="w-full space-y-2 text-center mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4 mt-2 text-left">
              인증 코드<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="flex gap-2 justify-center w-full">
              {authCode.map((code, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={code}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-first focus:border-transparent transition-all bg-white shadow-sm"
                />
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col mt-4 space-y-3">
            <Button
              className="w-full h-12 text-base font-semibold bg-first hover:bg-first/80"
              onClick={handleFinalRegist}
            >
              회원가입
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setStep(1)}
            >
              취소 (이전으로)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
