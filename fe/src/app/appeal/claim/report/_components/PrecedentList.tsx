import { PrecedentItem } from '../types';

interface PrecedentListProps {
  precedents: PrecedentItem[];
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
            <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[100px_1fr] gap-y-3.5 gap-x-4">
              <div className="text-sm text-gray-500 font-semibold whitespace-nowrap self-start pt-0.5">
                판례 번호
              </div>
              <div className="text-[15px] text-gray-700 leading-snug">{precedent.precedentNo}</div>

              <div className="text-sm text-gray-500 font-semibold whitespace-nowrap self-start pt-0.5">
                판례명
              </div>
              <div className="text-[15px] text-gray-900 font-bold leading-snug">
                {precedent.precedentName}
              </div>

              <div className="text-sm text-gray-500 font-semibold whitespace-nowrap self-start pt-0.5">
                유사도
              </div>
              <div className="text-[15px] font-black text-blue-600 leading-snug bg-blue-50 px-2 py-1 -ml-2 rounded w-max">
                {Math.round(precedent.similarityScore * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
