import { site } from "@/config/site";
import { appContainerClass } from "@/config/layout";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 py-8 text-center">
      <div className={cn(appContainerClass)}>
        <p className="text-xs text-muted-foreground">
          {site.name} · работает у вас на компьютере, файлы никуда не отправляются.
        </p>
      </div>
    </footer>
  );
}
