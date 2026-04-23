"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { streamUrl } from "@/lib/api";
import { Progress } from "./ui/progress";
import { formatDuration } from "@/lib/utils";

interface ProgressEvent {
  phase?: string;
  progress?: number;
  page?: number;
  total?: number;
  status?: string;
  error?: string;
}

interface Props {
  jobId: number;
  initialProgress: number;
  initialPage: number;
  initialTotal: number;
  initialStatus: string;
  onTerminal?: (status: "completed" | "failed", error?: string) => void;
}

export function JobProgress({
  jobId,
  initialProgress,
  initialPage,
  initialTotal,
  initialStatus,
  onTerminal,
}: Props) {
  const [ev, setEv] = useState<ProgressEvent>({
    progress: initialProgress,
    page: initialPage,
    total: initialTotal,
    status: initialStatus,
  });
  const startRef = useRef<number | null>(null);
  const terminalFired = useRef(false);

  useEffect(() => {
    if (initialStatus === "completed" || initialStatus === "failed") return;
    const es = new EventSource(streamUrl(jobId));
    es.addEventListener("progress", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as ProgressEvent;
        if (startRef.current == null && (data.progress ?? 0) > 0) {
          startRef.current = Date.now();
        }
        setEv((prev) => ({ ...prev, ...data }));
        if (data.status === "completed" || data.status === "failed") {
          if (!terminalFired.current) {
            terminalFired.current = true;
            onTerminal?.(data.status as any, data.error);
          }
          es.close();
        }
      } catch {}
    });
    es.onerror = () => {
      // Let the SSE lib auto-retry; no-op
    };
    return () => es.close();
  }, [jobId, initialStatus, onTerminal]);

  const pct = Math.round((ev.progress ?? 0) * 100);
  const eta = useMemo(() => {
    if (!startRef.current || !ev.progress || ev.progress <= 0.01) return null;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const total = elapsed / ev.progress;
    return Math.max(0, total - elapsed);
  }, [ev.progress]);

  const isRunning = ev.status !== "completed" && ev.status !== "failed";

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-4xl font-bold tabular-nums">{pct}%</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {ev.phase && ev.phase !== "snapshot" ? `Этап: ${ev.phase}` : "Обработка"}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="tabular-nums">
            {ev.page ?? 0}
            {ev.total ? ` / ${ev.total}` : ""} страниц
          </div>
          {isRunning && eta != null && (
            <div className="text-muted-foreground">
              осталось ~ {formatDuration(eta)}
            </div>
          )}
        </div>
      </div>
      <Progress value={pct} indeterminate={isRunning && pct < 2} />
    </div>
  );
}
