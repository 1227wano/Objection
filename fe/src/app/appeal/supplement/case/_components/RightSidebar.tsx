import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { MOCK_REBUTTAL_DATA } from '../../../answer/report/_mock/mockdata';
import { SidebarCard } from '@/components/ui/SidebarCard';

const rd = MOCK_REBUTTAL_DATA.data;

export default function RightSidebar() {
  return (
    <RightSidebarFrame>
      <SidebarCard title="답변서 요약">
        <div className="text-gray-700 text-[14.5px] leading-relaxed whitespace-pre-wrap">
          {rd.respondentSummary}
        </div>
      </SidebarCard>
    </RightSidebarFrame>
  );
}
