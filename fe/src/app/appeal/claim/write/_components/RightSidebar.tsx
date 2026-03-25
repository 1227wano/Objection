import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarCard } from '@/components/ui/SidebarCard';
import ChecklistCard from './ChecklistCard';
import IssuePointCard from './IssuePointCard';
import { LegalIssue } from '../../_types/shared';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';

interface Props {
  legalIssues: LegalIssue[];
}

export default function RightSidebar({ legalIssues }: Props) {
  return (
    <RightSidebarFrame>
      {/* 체크리스트 */}
      <ChecklistCard />

      {/* AI 주요 검토 쟁점 */}
      <SidebarCard title="AI 주요 검토 쟁점">
        <div className="flex flex-col gap-3">
          {legalIssues.map((issue, idx) => (
            <IssuePointCard key={idx} issue={issue} />
          ))}
        </div>
      </SidebarCard>
    </RightSidebarFrame>
  );
}
