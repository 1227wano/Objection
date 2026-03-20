import { Sparkles } from 'lucide-react';

interface SelectionCardProps {
  label: string;
  description: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
}

export default function SelectionCard({
  label,
  description,
  isSelected,
  isRecommended,
  onSelect,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex-1 text-left rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-white shadow-md shadow-blue-500/10'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
    >
      {/* AI 추천 뱃지 */}
      {isRecommended && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
          <Sparkles className="w-3 h-3" />
          AI 추천
        </div>
      )}

      {/* 라디오 인디케이터 */}
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
          ${isSelected ? 'border-blue-500' : 'border-gray-300'}`}
        >
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
        </div>

        <div className="flex flex-col gap-2">
          <span className={`text-lg font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
            {label}
          </span>
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
