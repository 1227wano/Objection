import AISummaryCard from './AISummaryCard';
import CaseAccordion from './CaseAccordion';
import { AnalysisData } from '../../report/types';

interface RightSidebarProps {
  data: AnalysisData;
}

export default function RightSidebar({ data }: RightSidebarProps) {
  return (
    <div className="w-80 shrink-0 border-l border-gray-200 bg-[#f8fafc] flex flex-col gap-4 p-5 sticky top-0 self-start h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <AISummaryCard data={data} />
      <CaseAccordion precedent={data.representativePrecedent} />
    </div>
  );
}
