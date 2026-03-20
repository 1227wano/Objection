import AISummaryCard from './AISummaryCard';
import CaseAccordion from './CaseAccordion';
import { AnalysisData } from '../../report/types';

interface RightSidebarProps {
  data: AnalysisData;
}

export default function RightSidebar({ data }: RightSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-70 shrink-0 sticky top-6 self-start animate-in fade-in slide-in-from-right-8 duration-500 delay-150 fill-mode-both">
      <AISummaryCard data={data} />
      <CaseAccordion precedent={data.representativePrecedent} />
    </aside>
  );
}
