import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ChecklistCard from '../../../claim/write/_components/ChecklistCard';
import IssuePointCard from '../../../claim/write/_components/IssuePointCard';
import RightSidebarFrame from '@/components/layout/RightSidebarFrame';
import { MOCK_SUPPLEMENT_ISSUES } from '../_mock/mockDocumentData';

const SUPPLEMENT_CHECKLIST = [
  {
    id: 'case-info',
    label: '사건번호 일치',
    description: '사건번호가 청구서에 기재한 번호와 동일한가요?',
    defaultChecked: true,
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

      {/* AI 주요 검토 쟁점 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-sm text-gray-900 mb-4">AI 주요 검토 쟁점</h3>
        <div className="flex flex-col gap-3">
          {MOCK_SUPPLEMENT_ISSUES.map((issue, idx) => (
            <IssuePointCard key={idx} issue={issue} />
          ))}
        </div>
      </div>

      {/* 보충 경위서 보기 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <Link href="/appeal/supplement/case">
          <Button variant="outline" className="w-full text-sm">
            내가 작성한 보충 경위서 보기
          </Button>
        </Link>
      </div>
    </RightSidebarFrame>
  );
}
