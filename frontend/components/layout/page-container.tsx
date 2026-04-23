import * as React from "react";

import { appContainerClass } from "@/config/layout";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Внутри 1440px: узкая колонка для форм, иначе на всю ширину контейнера. */
  size?: "default" | "narrow";
}

export function PageContainer({ children, className, size = "default" }: Props) {
  return (
    <div className={cn(appContainerClass, className)}>
      {size === "narrow" ? (
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
