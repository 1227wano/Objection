import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ChecklistCard from './ChecklistCard';
import IssuePointCard from './IssuePointCard';
import { LegalIssue } from '../_types/document';
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
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-4">AI 주요 검토 쟁점</h3>
        <div className="flex flex-col gap-3">
          {legalIssues.map((issue, idx) => (
            <IssuePointCard key={idx} issue={issue} />
          ))}
        </div>
      </div>

      {/* 사건 경위서 보기 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <Link href="/appeal/claim/incident">
          <Button variant="outline" className="w-full text-sm">
            내가 작성한 사건 경위서 보기
          </Button>
        </Link>
      </div>
    </RightSidebarFrame>
  );
}
