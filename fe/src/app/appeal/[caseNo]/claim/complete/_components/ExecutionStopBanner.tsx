'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExecutionStopBanner() {
  const router = useRouter();

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-xs font-bold text-red-500">필수 진행</span>
        </div>
        <p className="text-sm text-gray-700">
          영업정지를 즉시 멈추려면{' '}
          <span
            className="text-first underline cursor-pointer"
            onClick={() => router.push('/appeal/claim/suspension')}
          >
            집행정지신청
          </span>
          이 필수입니다.
        </p>
        <p className="text-xs text-gray-500">
          청구서 제출과 동시에 진행해야 처분의 효력을 일시적으로 정지할 수 있습니다.
        </p>
      </div>
      <Button onClick={() => router.push('/appeal/claim/suspension')} className="shrink-0">
        다음 단계: 집행정지신청서 작성하기 →
      </Button>
    </div>
  );
}
