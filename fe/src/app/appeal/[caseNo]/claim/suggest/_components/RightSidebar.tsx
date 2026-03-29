import AISummaryCard from './AISummaryCard';
import CaseAccordion from './CaseAccordion';
import { PrecedentResult } from '../../report/types';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';

interface RightSidebarProps {
  data: PrecedentResult;
}

export default function RightSidebar({ data }: RightSidebarProps) {
  const firstPrecedent = data.precedentInfos?.[0];

  return (
    <RightSidebarFrame>
      <AISummaryCard data={data} />
      {firstPrecedent && (
        <CaseAccordion
          precedent={{
            precedentNo: firstPrecedent.precedentNo,
            precedentName: firstPrecedent.precedentName,
            matchReason: firstPrecedent.matchReason,
            usagePoint: firstPrecedent.usagePoint,
            result: firstPrecedent.summary,
          }}
        />
      )}
    </RightSidebarFrame>
  );
}
