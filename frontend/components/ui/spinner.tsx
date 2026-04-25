import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-9 w-9 border-[3px]",
  lg: "h-12 w-12 border-[3px]",
} as const;

export interface SpinnerProps {
  size?: keyof typeof sizeStyles;
  className?: string;
  /** Подпись для скринридеров */
  label?: string;
}

/** Кольцевой индикатор загрузки */
export function Spinner({ size = "md", className, label = "Загрузка" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block shrink-0 rounded-full border-solid border-muted/45 border-t-primary animate-spin",
        sizeStyles[size],
        className
      )}
    />
  );
}

/** Центрированный блок с крупным спиннером для страниц и списков */
export function PageSpinner({ className, minHeight = "min-h-[12rem]" }: { className?: string; minHeight?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", minHeight, className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" label="Загрузка" />
    </div>
  );
}
