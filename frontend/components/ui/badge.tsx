import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "destructive" | "muted";

const styles: Record<Variant, string> = {
  default: "bg-primary/15 text-primary border-primary/30",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  destructive: "bg-red-500/15 text-red-400 border-red-500/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
