import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  message?: string;
}

export default function ErrorFallback({
  message = '데이터를 불러오는 중 오류가 발생했습니다.',
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <p className="text-red-500 font-semibold">{message}</p>
      <Button onClick={() => window.location.reload()}>다시 시도</Button>
    </div>
  );
}
