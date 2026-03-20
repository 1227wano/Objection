import { AnalysisData, APPEAL_TYPE_MAP, APPEAL_POSSIBILITY_MAP } from '../../report/types';

interface AISummaryCardProps {
  data: AnalysisData;
}

export default function AISummaryCard({ data }: AISummaryCardProps) {
  const strategyText = APPEAL_TYPE_MAP[data.claimType] ?? data.claimType;
  const possInfo = APPEAL_POSSIBILITY_MAP[data.appealPossibility];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-5 sticky top-6">
      <h3 className="text-base font-bold text-gray-900">AI 분석 요약</h3>

      {/* 최적 전략 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-400">최적 전략</span>
        <p className="text-sm font-bold text-gray-900">
          {strategyText}{' '}
          <span className={`font-extrabold ${possInfo.color}`}>({possInfo.text})</span>
        </p>
      </div>

      {/* 핵심 논리 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-red-400">핵심 논리</span>
        <p className="text-sm text-gray-700 leading-relaxed">{data.strategySummary}</p>
      </div>
    </div>
  );
}
