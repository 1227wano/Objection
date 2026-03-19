import * as React from "react";
import { cn } from "@/lib/utils";

export interface DocumentInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const DocumentInput = React.forwardRef<HTMLTextAreaElement, DocumentInputProps>(
  ({ label, className, ...props }, ref) => {
    // Generate an ID for accessibility if not provided
    const id = props.name || label.replace(/\s+/g, "-").toLowerCase();

    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <label
          htmlFor={id}
          className="text-base font-semibold text-gray-900 md:text-lg"
        >
          {label}
        </label>
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "flex min-h-[160px] w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
DocumentInput.displayName = "DocumentInput";
