import * as React from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow";
}

/** Контейнер `max-w` в колонке контента; внешний `appContainer` задаёт `app/(app)/layout` вместе с сайдбаром */
export function PageContainer({ children, className, size = "default" }: Props) {
  return (
    <div className={cn("w-full", className)}>
      {size === "narrow" ? (
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
