import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarCard } from '@/components/ui/SidebarCard';
import ChecklistCard from '../../../claim/write/_components/ChecklistCard';
import IssuePointCard from '../../../claim/write/_components/IssuePointCard';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';

const SUPPLEMENT_CHECKLIST = [
  {
    id: 'case-info',
    label: '사건번호 일치',
    description: '사건번호가 청구서에 기재한 번호와 동일한가요?',
    defaultChecked: false,
  },
  {
    id: 'rebuttal-complete',
    label: '반박 내용 누락 확인',
    description: '피청구인 주장에 대한 반박이 빠짐없이 포함되어 있나요?',
    defaultChecked: false,
  },
  {
    id: 'evidence-attached',
    label: '증거 서류 첨부',
    description: '주장을 뒷받침하는 증거 서류가 모두 첨부되어 있나요?',
    defaultChecked: false,
  },
  {
    id: 'typo-check',
    label: '오타 및 서명란 확인',
    description: '서명란이나 빈칸이 남아있지 않은지 확인해 주세요.',
    defaultChecked: false,
  },
];

export default function RightSidebar() {
  return (
    <RightSidebarFrame>
      {/* 보충서면용 체크리스트 */}
      <ChecklistCard title="보충서면 제출 전 필수 확인" items={SUPPLEMENT_CHECKLIST} />
    </RightSidebarFrame>
  );
}
