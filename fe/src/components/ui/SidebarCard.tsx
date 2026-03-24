import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SidebarCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SidebarCard({ title, children, className }: SidebarCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4',
        className,
      )}
    >
      {title && <h3 className="text-base font-bold text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
