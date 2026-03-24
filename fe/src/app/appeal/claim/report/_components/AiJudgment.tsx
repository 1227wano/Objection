import { Sparkles } from 'lucide-react';

interface AiJudgmentProps {
  summation: string;
  label?: string;
}

export default function AiJudgment({
  summation,
  label = 'AI 판단',
}: AiJudgmentProps) {
  return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-purple-50 rounded-full">
          <Sparkles className="w-6 h-6 text-purple-400" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{label}</h2>
          <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">{summation}</p>
        </div>
    </div>
  );
}
