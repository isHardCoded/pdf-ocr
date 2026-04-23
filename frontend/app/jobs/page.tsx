"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { deleteJob, downloadUrl, Job, listJobs } from "@/lib/api";
import { formatBytes } from "@/lib/utils";

function statusBadge(s: Job["status"]) {
  switch (s) {
    case "completed":
      return <Badge variant="success">Готово</Badge>;
    case "failed":
      return <Badge variant="destructive">Ошибка</Badge>;
    case "running":
      return <Badge variant="default">В работе</Badge>;
    default:
      return <Badge variant="muted">В очереди</Badge>;
  }
}

export default function JobsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
    refetchInterval: (q) => {
      const jobs = q.state.data as Job[] | undefined;
      if (!jobs) return 3000;
      return jobs.some((j) => j.status === "running" || j.status === "pending")
        ? 3000
        : false;
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Удалено");
    },
    onError: (e: any) => toast.error(e?.message || "Ошибка удаления"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">История задач</h1>
          <p className="text-sm text-muted-foreground">
            Все созданные OCR-задачи. Данные хранятся локально.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Новая задача
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-lg font-medium">Пока пусто</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Загрузите первый PDF на главной странице.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((j) => (
            <li key={j.id}>
              <div className="glass flex flex-col gap-4 rounded-xl p-5 transition-colors hover:bg-card/80 sm:flex-row sm:items-center">
                <Link href={`/jobs/${j.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{j.filename}</p>
                      {statusBadge(j.status)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(j.input_size)}
                      {j.total_pages > 0 && ` · ${j.total_pages} стр.`}
                      {" · "}
                      {new Date(j.created_at + "Z").toLocaleString()}
                    </div>
                    {(j.status === "running" || j.status === "pending") && (
                      <div className="mt-2">
                        <Progress
                          value={Math.round(j.progress * 100)}
                          indeterminate={j.progress < 0.01}
                        />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {j.status === "completed" && (
                    <a
                      href={downloadUrl(j.id)}
                      download={j.filename.replace(/\.pdf$/i, "") + ".ocr.pdf"}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input hover:bg-accent"
                      title="Скачать"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => del.mutate(j.id)}
                    disabled={del.isPending}
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
