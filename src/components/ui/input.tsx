import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn("border w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary", className)} {...props} />;
  }
);
Input.displayName = "Input";
