import { AnalysisData, APPEAL_TYPE_MAP, APPEAL_POSSIBILITY_MAP } from '../../report/types';

interface AISummaryCardProps {
  data: AnalysisData;
}

export default function AISummaryCard({ data }: AISummaryCardProps) {
  const strategyText = APPEAL_TYPE_MAP[data.claimType] ?? data.claimType;
  const possInfo = APPEAL_POSSIBILITY_MAP[data.appealPossibility];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-5">
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
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold text-red-400">핵심 논리</span>
        {/* 1. 전체 요약 텍스트 */}
        <p className="text-sm text-gray-700 leading-relaxed mb-1">{data.strategySummary}</p>

        {/* 2. 추가된 부분: mainPoints 리스트 */}
        <ul className="flex flex-col gap-3">
          {data.mainPoints.map((item, idx) => (
            <li key={idx} className="flex flex-col gap-0.5">
              <div className="flex gap-2">
                <span className="text-red-500 font-bold text-sm">•</span>
                <p className="text-sm font-bold text-gray-800 leading-snug">{item.point}</p>
              </div>
              <p className="text-[12px] text-gray-500 pl-4 leading-relaxed">{item.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
