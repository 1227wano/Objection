interface AiJudgmentProps {
  summation: string;
}

export default function AiJudgment({ summation }: AiJudgmentProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-gray-900">AI 판단</h2>
      <div className="bg-gray-50 border-l-4 border-blue-500 px-5 py-4 rounded-r-xl text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm">
        {summation}
      </div>
    </div>
  );
}
