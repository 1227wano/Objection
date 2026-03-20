import { Square, CheckSquare } from 'lucide-react';

interface ChecklistItemProps {
  title: string;
  checked: boolean;
  onToggle: () => void;
}

export default function ChecklistItem({
  title,
  checked,
  onToggle,
}: ChecklistItemProps) {
  return (
    <div
      className={`flex items-center rounded-xl border p-5 transition-all duration-200 cursor-pointer
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
    </div>
  );
}

