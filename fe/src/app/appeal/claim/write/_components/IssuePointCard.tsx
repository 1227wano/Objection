import { LegalIssue } from '../_types/document';

interface Props {
  issue: LegalIssue;
}

const RISK_BADGE: Record<string, { label: string; className: string }> = {
  HIGH: { label: '핵심', className: 'bg-red-50 text-red-600' },
  MEDIUM: { label: '보조', className: 'bg-orange-50 text-orange-600' },
  LOW: { label: '참고', className: 'bg-gray-100 text-gray-500' },
};

export default function IssuePointCard({ issue }: Props) {
  const badge = RISK_BADGE[issue.riskLevel] ?? RISK_BADGE.LOW;

  const handleScroll = () => {
    const el = document.getElementById(`arg-${issue.issueType}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-blue-400');
    setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 1500);
  };

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-sm text-gray-900">{issue.title}</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{issue.description}</p>
      <button
        onClick={handleScroll}
        className="text-xs text-first font-semibold text-left hover:underline mt-1"
      >
        📍 청구원인 2항으로 이동
      </button>
    </div>
  );
}
