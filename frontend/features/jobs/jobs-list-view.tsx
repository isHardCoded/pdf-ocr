"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Download, FileText, Loader2, Plus, Trash2 } from "lucide-react";

import { Pagination } from "@/components/pagination";
import { PageContainer } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { JobStatusBadge } from "./components/job-status-badge";
import { deleteJob, downloadUrl, type Job, listJobs } from "@/lib/api";
import { cn, formatBytes } from "@/lib/utils";

const PAGE_SIZE = 9;

export function JobsListView() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", page, PAGE_SIZE],
    queryFn: () => listJobs({ page, page_size: PAGE_SIZE }),
    refetchInterval: (q) => {
      const list = (q.state.data as { items?: Job[] } | undefined)?.items;
      if (!list?.length) return 3000;
      return list.some((j) => j.status === "running" || j.status === "pending") ? 3000 : false;
    },
  });

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (data && data.total_pages > 0 && page > data.total_pages) {
      setPage(data.total_pages);
    }
  }, [data, page]);

  const del = useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Удалено");
    },
    onError: (e: { message?: string }) => toast.error(e?.message || "Не удалось удалить"),
  });

  const showEmpty = useMemo(
    () => !isLoading && data && data.total === 0,
    [isLoading, data]
  );

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">История</h1>
            {data != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.total} {pluralize(data.total, "задача", "задачи", "задач")}
              </p>
            )}
          </div>
          <Link href="/" className={cn(buttonVariants(), "inline-flex w-full justify-center sm:w-auto")}>
            <Plus className="h-4 w-4" />
            Новая задача
          </Link>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Загрузка…
          </div>
        ) : showEmpty ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">Пока нет задач</p>
              <Link href="/" className={cn(buttonVariants({ variant: "secondary" }), "text-sm")}>
                Создать
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <ul
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Список задач"
            >
              {items.map((j) => (
                <li key={j.id} className="flex min-h-[200px]">
                  <Card
                    className={cn(
                      "flex w-full flex-col overflow-hidden border-border/70",
                      "transition-all duration-200 hover:border-primary/35 hover:shadow-md"
                    )}
                  >
                    <CardContent className="flex flex-1 flex-col p-4">
                      <Link
                        href={`/jobs/${j.id}`}
                        className="group flex min-h-0 flex-1 flex-col rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15"
                            aria-hidden
                          >
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 break-words text-sm font-medium text-foreground group-hover:underline">
                              {j.filename}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <JobStatusBadge status={j.status} />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {formatBytes(j.input_size)}
                          {j.total_pages > 0 && ` · ${j.total_pages} стр.`}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/80">
                          {new Date(j.created_at + "Z").toLocaleString()}
                        </p>
                        {(j.status === "running" || j.status === "pending") && (
                          <div className="mt-3">
                            <Progress
                              value={Math.round(j.progress * 100)}
                              indeterminate={j.progress < 0.01}
                            />
                          </div>
                        )}
                      </Link>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-end gap-1">
                        {j.status === "completed" && (
                          <a
                            href={downloadUrl(j.id)}
                            download={j.filename.replace(/\.pdf$/i, "") + ".ocr.pdf"}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "icon" }),
                              "h-9 w-9 transition-colors hover:bg-accent"
                            )}
                            title="Скачать"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        <Button
                          size="icon"
                          type="button"
                          variant="outline"
                          className="h-9 w-9 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => del.mutate(j.id)}
                          disabled={del.isPending}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="pt-2"
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}

function pluralize(n: number, one: string, few: string, many: string) {
  const a = Math.abs(n) % 100;
  if (a >= 11 && a <= 14) return many;
  const m = Math.abs(n) % 10;
  if (m === 1) return one;
  if (m >= 2 && m <= 4) return few;
  return many;
}
