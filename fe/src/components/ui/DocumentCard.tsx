import { ReactNode } from "react";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DocumentCard({ children, className, ...props }: DocumentCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-gray-100 bg-white p-6 shadow-md md:p-8",
        className
      )}
      {...props}
    >
      <div className="absolute top-4 right-4 text-gray-300 rotate-12">
        <Paperclip size={28} />
      </div>
      {children}
    </div>
  );
}
