import { ShieldAlert } from 'lucide-react';

interface RespondentSummaryProps {
  summary: string;
}

export default function RespondentSummary({ summary }: RespondentSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-bold text-blue-700">피청구인 주장 요약</h2>
      </div>
      <div className="mt-1 bg-blue-50 border-l-4 border-blue-400 px-5 py-4 rounded-r-xl text-gray-800 text-lg leading-relaxed whitespace-pre-wrap shadow-sm">
        {summary}
      </div>
    </div>
  );
}
