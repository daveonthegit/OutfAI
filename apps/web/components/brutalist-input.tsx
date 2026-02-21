import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function BrutalistInput({
  label,
  className,
  ...props
}: BrutalistInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full bg-secondary border border-border px-4 py-3 text-sm text-foreground",
          "placeholder:text-muted-foreground placeholder:uppercase placeholder:tracking-wider placeholder:text-[11px]",
          "focus:outline-none focus:border-foreground transition-colors duration-100",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    </div>
  );
}
