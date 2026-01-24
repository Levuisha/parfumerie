import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white ring-offset-[#0a0a0a] placeholder:text-[#707070] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]/20 focus-visible:border-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
