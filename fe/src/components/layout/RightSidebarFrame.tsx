import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RightSidebarFrameProps {
  children: ReactNode;
  className?: string;
}

export default function RightSidebarFrame({ children, className }: RightSidebarFrameProps) {
  return (
    <div
      className={cn(
        'w-80 shrink-0 border-l border-gray-200 bg-[#f8fafc] flex flex-col gap-4 p-5 sticky top-0 self-start h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        className,
      )}
    >
      {children}
    </div>
  );
}
