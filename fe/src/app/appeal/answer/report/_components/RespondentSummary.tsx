interface RespondentSummaryProps {
  summary: string;
}

export default function RespondentSummary({ summary }: RespondentSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-gray-900">답변서 요약</h2>
      <div className="bg-gray-50 border-l-4 border-gray-300 px-5 py-4 rounded-r-xl text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm">
        {summary}
      </div>
    </div>
  );
}
