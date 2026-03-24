'use client';

import { MainPoint } from '../types';

interface MainPointCardProps {
  points: MainPoint[];
}

export default function MainPointCard({ points }: MainPointCardProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        핵심 대응 포인트
      </h3>

      <div className="flex flex-col gap-4">
        {points.map((mp, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden"
          >
            {/* 상단: 번호 + 키워드 뱃지 */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-2">
              <span className="text-blue-500 font-bold shrink-0 text-base">
                {idx + 1}.
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-base font-bold rounded-full border border-blue-200">
                {mp.point}
              </span>
            </div>

            {/* 중간: 대응 방향 */}
            <div className="px-5 pt-4 pb-4 border-t border-gray-50">
              <span className="font-semibold text-gray-900 text-base">대응 방향</span>
              <p className="text-gray-700 text-base leading-relaxed mt-1.5">{mp.reason}</p>
            </div>

            {/* 하단: 근거 */}
            <div className="px-5 pt-4 pb-5 border-t border-gray-100">
              <span className="font-semibold text-blue-800 text-base">근거</span>
              <div className="mt-2 bg-blue-50/60 border border-blue-100 rounded-lg p-3.5">
                <p className="text-gray-700 text-[15px] leading-relaxed italic">
                  &quot;{mp.sourceText}&quot;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
