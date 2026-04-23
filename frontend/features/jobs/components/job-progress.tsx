"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { streamUrl } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ProgressEvent {
  phase?: string;
  progress?: number;
  page?: number;
  total?: number;
  status?: string;
  error?: string;
}

export interface JobProgressProps {
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
}: JobProgressProps) {
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
            onTerminal?.(data.status as "completed" | "failed", data.error);
          }
          es.close();
        }
      } catch {
        // ignore bad SSE payloads
      }
    });
    es.onerror = () => {};
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">{pct}%</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {ev.phase && ev.phase !== "snapshot" ? `Этап: ${ev.phase}` : "Идёт обработка…"}
          </p>
        </div>
        <div className="text-left text-sm sm:text-right">
          <div className="tabular-nums text-foreground">
            {ev.page ?? 0}
            {ev.total ? ` / ${ev.total}` : ""} стр.
          </div>
          {isRunning && eta != null && (
            <div className="text-muted-foreground">Осталось ~{formatDuration(eta)}</div>
          )}
        </div>
      </div>
      <Separator />
      <Progress value={pct} indeterminate={isRunning && pct < 2} />
    </div>
  );
}
