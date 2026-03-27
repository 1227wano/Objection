'use client';

import { CircleAlert, Scale } from 'lucide-react';

export interface MainPoint {
  point: string;
  reason: string;
  sourceText: string;
}

interface MainPointCardProps {
  points: MainPoint[];
  title?: string;
}

export default function MainPointCard({ points, title = '핵심 쟁점' }: MainPointCardProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600" />
        {title}
      </h3>

      <div className="flex flex-col gap-5">
        {points.map((mp, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative"
          >
            {/* 상단: 번호 + 키워드 (형광펜 효과) */}
            <div className="px-5 pt-6 pb-3">
              <h4 className="text-lg font-extrabold text-gray-900 relative inline-block z-10">
                <span className="text-blue-600 mr-2">{idx + 1}.</span>
                {mp.point}
                <span className="absolute bottom-0.5 left-0 w-full h-2.5 bg-blue-100/50 -z-10 rounded-sm" />{' '}
              </h4>
            </div>

            {/* 중간: 대응 방향 */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <CircleAlert className="w-4 h-4 text-gray-700" />
                <span className="font-bold text-gray-900 text-base">대응 방향</span>
              </div>
              <p className="text-gray-800 text-base leading-relaxed pl-5.5">{mp.reason}</p>
            </div>

            {/* 하단: 근거 */}
            <div className="px-5 pt-4 pb-5 bg-gray-50/50 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Scale className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-blue-800 text-base">근거</span>
              </div>
              <div className="mt-2 bg-white border-l-4 border-blue-500 shadow-sm rounded-r-lg p-4">
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
