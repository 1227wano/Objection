import { CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  descriptionColor?: string;
  badge?: {
    text: string;
    icon?: ReactNode;
  };
}

export default function SectionHeader({ title, description, descriptionColor = 'text-second', badge }: SectionHeaderProps) {
  return (
    <div className="mb-8 w-full text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        {badge && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold tracking-tight">
            {badge.icon || <CheckCircle2 className="w-4 h-4" />}
            <span>{badge.text}</span>
          </div>
        )}
      </div>
      {description && (
        <div className={`mt-3 ml-2 text-sm sm:text-base ${descriptionColor}`}>
          {description}
        </div>
      )}
    </div>
  );
}
