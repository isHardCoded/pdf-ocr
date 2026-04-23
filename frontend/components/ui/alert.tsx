import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border/60 bg-card/50 text-foreground",
  destructive: "border-destructive/50 bg-destructive/10 text-foreground",
};

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: keyof typeof variants }) {
  return (
    <div
      className={cn("rounded-lg border p-4 text-sm", variants[variant], className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-1 font-medium leading-none", className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted-foreground [&_a]:underline", className)} {...props} />;
}
