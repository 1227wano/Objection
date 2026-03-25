'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface ApiResult {
  status: 'SUCCESS' | 'FAIL' | 'ERROR';
  message: string;
  data: null;
}

type FormDataState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ErrorState = FormDataState;

const INITIAL_FORM_DATA: FormDataState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const INITIAL_ERRORS: ErrorState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegistForm() {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormDataState>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<ErrorState>(INITIAL_ERRORS);
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  function clearFieldError(field: keyof ErrorState) {
    if (!errors[field]) {
      return;
    }

    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const field = name as keyof FormDataState;

    setFormData((current) => ({ ...current, [field]: value }));
    clearFieldError(field);

    if (submitError) {
      setSubmitError('');
    }
  }

  function validateStepOne() {
    const nextErrors: ErrorState = { ...INITIAL_ERRORS };

    if (!formData.name.trim()) {
      nextErrors.name = '이름을 입력해 주세요.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        nextErrors.email = '올바른 이메일 형식으로 입력해 주세요.';
      }
    }

    if (!formData.password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    } else if (formData.password.length < 8) {
      nextErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = '비밀번호 확인을 입력해 주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = '비밀번호가 서로 일치하지 않습니다.';
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleNextStep() {
    setSubmitError('');

    if (!validateStepOne()) {
      return;
    }

    setIsSendingCode(true);

    try {
      const response = await apiClient.post<ApiResult>('/auth/email/send', {
        email: formData.email.trim(),
        purpose: 'SIGNUP',
      });

      if (response.status === 'SUCCESS') {
        setStep(2);
        return;
      }

      setSubmitError(response.message || '인증 코드를 보내지 못했습니다.');
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message || '인증 코드를 보내지 못했습니다.');
      } else {
        setSubmitError('인증 코드를 보내지 못했습니다.');
      }
    } finally {
      setIsSendingCode(false);
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^[0-9]*$/.test(value)) {
      return;
    }

    const nextCode = [...authCode];
    nextCode[index] = value;
    setAuthCode(nextCode);

    if (submitError) {
      setSubmitError('');
    }

    if (value && index < authCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !authCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleFinalRegist() {
    const codeString = authCode.join('');

    if (codeString.length !== 6) {
      setSubmitError('인증번호 6자리를 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const verifyResponse = await apiClient.post<ApiResult>('/auth/email/verify', {
        email: formData.email.trim(),
        code: codeString,
        purpose: 'SIGNUP',
      });

      if (verifyResponse.status !== 'SUCCESS') {
        setSubmitError(verifyResponse.message || '이메일 인증 확인에 실패했습니다.');
        return;
      }

      const signupResponse = await apiClient.post<ApiResult>('/auth/signup', {
        userId: formData.email.trim(),
        userPw: formData.password,
        userName: formData.name.trim(),
      });

      if (signupResponse.status === 'SUCCESS') {
        window.alert(signupResponse.message || '회원가입이 완료되었습니다. 로그인해 주세요.');
        router.push('/login');
        return;
      }

      setSubmitError(signupResponse.message || '회원가입에 실패했습니다.');
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message || '이메일 인증 확인 또는 회원가입 중 오류가 발생했습니다.');
      } else {
        setSubmitError('이메일 인증 확인 또는 회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function getInputClassName(errorMessage: string) {
    const baseClass =
      'w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2';

    return errorMessage
      ? `${baseClass} border-red-500 focus:ring-red-500`
      : `${baseClass} border-gray-300 focus:ring-first`;
  }

  return (
    <div className="flex flex-col items-center pt-2 pb-4">
      <div className="mb-4">
        <Image
          src="/logo.svg"
          alt="행정심판 비서 로고"
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      <h2 className="mb-2 text-xl font-bold text-gray-900">회원가입</h2>
      <p className="mb-6 text-sm text-gray-500">가입에 필요한 정보를 입력해 주세요.</p>

      {step === 1 ? (
        <>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-5 [@media_screen_and_(max-height:850px)]:sm:grid-cols-2">
            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-gray-700">
                이름<span className="ml-0.5 text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="실명을 입력해 주세요."
                  className={getInputClassName(errors.name)}
                />
                {errors.name ? <p className="mt-2 ml-1 text-xs text-red-500">{errors.name}</p> : null}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-gray-700">
                이메일(아이디)<span className="ml-0.5 text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해 주세요."
                  className={getInputClassName(errors.email)}
                />
                {errors.email ? (
                  <p className="mt-2 ml-1 text-xs text-red-500">{errors.email}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-gray-700">
                비밀번호<span className="ml-0.5 text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호는 8자 이상이어야 합니다."
                  className={getInputClassName(errors.password)}
                />
                {errors.password ? (
                  <p className="mt-2 ml-1 text-xs text-red-500">{errors.password}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="block text-sm font-semibold text-gray-700">
                비밀번호 확인<span className="ml-0.5 text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 한 번 더 입력해 주세요."
                  className={getInputClassName(errors.confirmPassword)}
                />
                {errors.confirmPassword ? (
                  <p className="mt-2 ml-1 text-xs text-red-500">{errors.confirmPassword}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8 flex w-full flex-col space-y-3">
            {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
            <Button
              type="button"
              className="h-12 w-full bg-first text-base font-semibold hover:bg-first/80"
              onClick={handleNextStep}
              disabled={isSendingCode}
            >
              {isSendingCode ? '인증번호 전송 중...' : '다음(이메일 인증)'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full border border-gray-300 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => router.back()}
              disabled={isSendingCode}
            >
              이전
            </Button>
          </div>
        </>
      ) : (
        <div className="flex w-full flex-col items-center">
          <div className="mb-8 w-full space-y-2 text-center">
            <label className="mb-4 mt-2 block text-left text-sm font-semibold text-gray-700">
              인증번호<span className="ml-0.5 text-red-500">*</span>
            </label>
            <div className="flex w-full justify-center gap-2">
              {authCode.map((code, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={code}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  onChange={(event) => handleCodeChange(index, event.target.value)}
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                  className="h-14 w-12 rounded-lg border border-gray-300 bg-white text-center text-xl font-bold text-gray-900 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-first md:h-16 md:w-14 md:text-2xl"
                />
              ))}
            </div>
            <p className="mt-3 text-left text-xs leading-5 text-slate-500">
              입력하신 이메일로 인증 코드를 보냈어요. 받은 인증번호 6자리를 입력해 주세요.
            </p>
            {submitError ? <p className="mt-3 text-left text-sm text-red-500">{submitError}</p> : null}
          </div>

          <div className="mt-4 flex w-full flex-col space-y-3">
            <Button
              type="button"
              className="h-12 w-full bg-first text-base font-semibold hover:bg-first/80"
              onClick={handleFinalRegist}
              disabled={isSubmitting}
            >
              {isSubmitting ? '회원가입 중...' : '회원가입'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full border border-gray-300 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              이전(정보 수정)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
