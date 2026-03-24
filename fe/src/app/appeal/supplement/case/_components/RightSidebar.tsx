import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { MOCK_REBUTTAL_DATA } from '../../../answer/report/_mock/mockdata';

const rd = MOCK_REBUTTAL_DATA.data;

export default function RightSidebar() {
  return (
    <RightSidebarFrame>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-900">답변서 요약</h3>
        <div className="bg-gray-50 border-l-4 border-gray-300 px-4 py-3 rounded-r-lg text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {rd.respondentSummary}
        </div>
      </div>
    </RightSidebarFrame>
  );
}
