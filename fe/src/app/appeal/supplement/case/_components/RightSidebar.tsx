import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { MOCK_REBUTTAL_DATA } from '../../../answer/report/_mock/mockdata';
import { SidebarCard } from '@/components/ui/SidebarCard';

const rd = MOCK_REBUTTAL_DATA.data;

export default function RightSidebar() {
  return (
    <RightSidebarFrame>
      <SidebarCard title="답변서 요약">
        <div className="bg-gray-50 border-l-4 border-gray-300 px-4 py-3 rounded-r-lg text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {rd.respondentSummary}
        </div>
      </SidebarCard>
    </RightSidebarFrame>
  );
}
