import { PrecedentResult, APPEAL_TYPE_MAP, APPEAL_POSSIBILITY_MAP } from '../../report/types';
import { SidebarCard } from '@/components/ui/SidebarCard';

interface AISummaryCardProps {
  data: PrecedentResult;
}

function normalizeAppealPossibility(val: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (val === 'H' || val === 'HIGH') return 'HIGH';
  if (val === 'M' || val === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

export default function AISummaryCard({ data }: AISummaryCardProps) {
  const strategyText = APPEAL_TYPE_MAP[data.claimType] ?? data.claimType;
  const possInfo = APPEAL_POSSIBILITY_MAP[normalizeAppealPossibility(data.appealPossibility)];

  return (
    <SidebarCard title="AI 분석 요약">
      {/* 최적 전략 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-400">최적 전략</span>
        <p className="text-sm font-bold text-gray-900">
          {strategyText}{' '}
          <span className={`font-extrabold ${possInfo.color}`}>({possInfo.text})</span>
        </p>
      </div>

      {/* 핵심 논리 */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold text-red-400">핵심 논리</span>
        <p className="text-sm text-gray-700 leading-relaxed mb-1">{data.strategySummary}</p>
      </div>
    </SidebarCard>
  );
}
