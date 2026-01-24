import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#ff6b35] text-white hover:bg-[#ff8c42] shadow-[0_4px_12px_rgba(255,107,53,0.3)] transition-all duration-300 hover:scale-105",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white transition-all duration-300",
        secondary: "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] transition-all duration-300",
        ghost: "hover:bg-[#1a1a1a] text-[#a0a0a0] transition-all duration-300",
        link: "text-[#ff6b35] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
