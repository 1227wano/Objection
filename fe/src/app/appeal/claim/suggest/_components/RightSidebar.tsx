import AISummaryCard from './AISummaryCard';
import CaseAccordion from './CaseAccordion';
import { AnalysisData } from '../../report/types';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';

interface RightSidebarProps {
  data: AnalysisData;
}

export default function RightSidebar({ data }: RightSidebarProps) {
  return (
    <RightSidebarFrame>
      <AISummaryCard data={data} />
      <CaseAccordion precedent={data.representativePrecedent} />
    </RightSidebarFrame>
  );
}
