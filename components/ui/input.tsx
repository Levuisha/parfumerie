import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-white ring-offset-[#0a0a0a] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#707070] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]/20 focus-visible:border-[#ff6b35] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
