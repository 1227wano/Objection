import { Square, CheckSquare } from 'lucide-react';

interface ChecklistItemProps {
  title: string;
  checked: boolean;
  checkedAt: string | null;
  onToggle: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 확인됨`;
}

export default function ChecklistItem({
  title,
  checked,
  checkedAt,
  onToggle,
}: ChecklistItemProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-5 transition-all duration-200 cursor-pointer
        ${checked
          ? 'border-blue-200 bg-blue-50/40'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 shrink-0 text-gray-400">
          {checked ? (
            <CheckSquare className="w-5 h-5 text-blue-500" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </div>
        <span className={`font-bold text-[15px] ${checked ? 'text-blue-700 line-through' : 'text-gray-900'}`}>
          {title}
        </span>
      </div>
      <span className="text-sm font-semibold whitespace-nowrap ml-4 shrink-0">
        {checkedAt ? (
          <span className="text-green-600">{formatDate(checkedAt)}</span>
        ) : (
          <span className="text-blue-500 hover:underline">나중에 준비하기</span>
        )}
      </span>
    </div>
  );
}
