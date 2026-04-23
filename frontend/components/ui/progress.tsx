import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0..100
  indeterminate?: boolean;
}

export function Progress({
  className,
  value = 0,
  indeterminate = false,
  ...props
}: ProgressProps) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-[width] duration-500 ease-out progress-shimmer",
          indeterminate && "animate-shimmer"
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
