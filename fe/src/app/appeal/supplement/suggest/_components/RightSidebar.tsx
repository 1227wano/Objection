import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { MOCK_REBUTTAL_DATA } from '../../../answer/report/_mock/mockdata';

const rd = MOCK_REBUTTAL_DATA.data;

export default function RightSidebar() {
  return (
    <RightSidebarFrame>
      {/* AI 분석 요약 — 일반 카드 스타일 (콜아웃 아님) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-5">
        <h3 className="text-base font-bold text-gray-900">AI 분석 요약</h3>

        {/* 전략 요약 */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-400">대응 전략</span>
          <p className="text-sm text-gray-700 leading-relaxed">{rd.strategySummary}</p>
        </div>

        {/* 핵심 대응 포인트 */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-red-400">핵심 논리</span>
          <ul className="flex flex-col gap-3">
            {rd.mainPoints.map((item, idx) => (
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
    </RightSidebarFrame>
  );
}
