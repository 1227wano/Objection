import { EnrichedPrecedent } from '../types';

interface PrecedentListProps {
  precedents: EnrichedPrecedent[];
}

export default function PrecedentList({ precedents }: PrecedentListProps) {
  if (!precedents || precedents.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-gray-900">유사 판례</h2>

      <div className="flex flex-col gap-4">
        {precedents.map((precedent, idx) => (
          <div
            key={idx}
            className="border border-gray-200 bg-white rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* 헤더: 판례 번호 + 유사도 badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-semibold">{precedent.precedentNo}</span>
              {precedent.similarityScore !== undefined && (
                <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                  유사도 {Math.round(precedent.similarityScore * 100)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[100px_1fr] gap-y-3.5 gap-x-4">
              <div className="text-sm text-gray-500 font-semibold whitespace-nowrap self-start pt-0.5">
                판례명
              </div>
              <div className="text-[15px] text-gray-900 font-bold leading-snug">
                {precedent.precedentName}
              </div>

              <div className="text-sm text-gray-500 font-semibold whitespace-nowrap self-start pt-0.5">
                매칭 사유
              </div>
              <div className="text-[15px] text-gray-700 leading-snug">{precedent.matchReason}</div>

              <div className="text-sm text-gray-500 font-semibold whitespace-nowrap self-start pt-0.5">
                활용 포인트
              </div>
              <div className="text-[15px] text-gray-700 leading-snug">{precedent.usagePoint}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
