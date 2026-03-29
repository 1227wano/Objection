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
      {/* 1. 체크리스트 */}
      <ChecklistCard />

      {/* 2. 작성 팁 */}
      <SidebarCard title="💡 빈칸 채우기 팁">
        <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-gray-700">
          <div>
            <span className="font-bold text-gray-900 block mb-0.5">Q. 피청구인이 누구인가요?</span>
            받으신 <strong className="text-blue-600">처분통지서 맨 아랫부분</strong>을 확인해
            보세요. 직인이 찍혀 있는 <strong className="text-gray-900">처분 행정청의 장</strong>이
            피청구인입니다. (예: 서울특별시 OOO구청장)
            <br />
          </div>

          <div className="w-full h-px bg-gray-100 my-1"></div>

          <div>
            <span className="font-bold text-gray-900 block mb-0.5">
              Q. 소관 위원회는 어디서 확인하나요?
            </span>
            처분통지서 하단이나 뒷면의{' '}
            <strong className="text-blue-600">불복절차(행정심판) 안내문</strong>에 소관 위원회가
            적혀 있습니다.
          </div>
        </div>
      </SidebarCard>

      {/* 3. AI 주요 검토 쟁점 (legalIssues 데이터가 있을 경우 표시) */}
      {legalIssues && legalIssues.length > 0 && (
        <SidebarCard title="AI 주요 검토 쟁점">
          <div className="flex flex-col gap-3">
            {legalIssues.map((issue, idx) => (
              <IssuePointCard key={idx} issue={issue} />
            ))}
          </div>
        </SidebarCard>
      )}
    </RightSidebarFrame>
  );
}
