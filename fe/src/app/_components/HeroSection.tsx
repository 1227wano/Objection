'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartUpload: () => void;
}

export default function HeroSection({ onStartUpload }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[600px] py-28 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 p-4 md:p-8 flex justify-center items-center opacity-[0.03] pointer-events-none z-0">
        <Image src="/logo.svg" alt="logo background" fill className="object-contain" />
      </div>

      <div className="z-10 flex flex-col items-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-first mb-6 leading-tight">
          초보자도 쉬운 행정심판, <br className="hidden sm:block" />
          당신의 든든한 AI 파트너 이의있음!
        </h1>
        <p className="text-gray-600 mb-10 max-w-xl text-lg break-keep">
          복잡한 법률 용어와 절차, 이제 AI와 함께 쉽고 정확하게 해결하세요.{' '}
          <br className="hidden sm:block" />
          당신의 정당한 권리를 지키는 가장 스마트한 방법입니다.
        </p>
        <Button
          size="lg"
          className="rounded-full text-lg px-8 h-14 font-semibold shadow-lg"
          onClick={onStartUpload}
        >
          무료로 상담 시작하기 →
        </Button>
      </div>
    </section>
  );
}
