import { CheckCircle2 } from 'lucide-react';

export default function ReportHeader() {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        본안 판단 결과 보고서
      </h1>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold tracking-tight">
        <CheckCircle2 className="w-4 h-4" />
        <span>AI 검토 완료</span>
      </div>
    </div>
  );
}
