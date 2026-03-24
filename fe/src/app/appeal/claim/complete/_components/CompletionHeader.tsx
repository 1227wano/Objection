'use client';

import { CircleCheckBig } from 'lucide-react';

interface CompletionHeaderProps {
  title?: string;
  description?: string;
}

export default function CompletionHeader({
  title = '행정심판 청구서 작성이 완료되었습니다.',
  description = '아래 두 가지 방법 중 편하신 방식을 선택하여 제출을 진행해 주세요.',
}: CompletionHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-10 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CircleCheckBig className="w-8 h-8 text-green-600" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-base text-gray-500">{description}</p>
      </div>
    </div>
  );
}
