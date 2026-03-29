'use client';

interface AnalysisSummaryCardProps {
  summary?: string;
  details?: { label: string; value: string }[];
}

export default function AnalysisSummaryCard({ summary, details }: AnalysisSummaryCardProps) {
  if (!summary && (!details || details.length === 0)) return null;

  return (
    <div className="mb-14">
      <h2 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center">
        <span className="text-first font-extrabold mr-3 text-[24px]">•</span>
        처분서 내용 요약
      </h2>
      <div className="bg-white border border-gray-200 border-l-[4px] border-l-second p-6 md:p-8 rounded-xl shadow-sm">
        <div className="max-w-fit mx-auto">
          <p className="text-gray-800 whitespace-pre-wrap font-medium leading-[1.8] text-[15px] tracking-wide ">
            {summary || '처분서 내용이 없습니다.'}
          </p>
        </div>
      </div>
    </div>
  );
}
