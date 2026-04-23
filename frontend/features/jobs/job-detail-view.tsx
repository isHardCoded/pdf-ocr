"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Download, FileText, Trash2 } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatBytes } from "@/lib/utils";
import { deleteJob, downloadUrl, getJob, type Job } from "@/lib/api";
import { JobProgress } from "./components/job-progress";
import { JobStatusBadge } from "./components/job-status-badge";

export function JobDetailView() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id),
    enabled: Number.isFinite(id),
    refetchInterval: (q) => {
      const s = (q.state.data as Job | undefined)?.status;
      return s === "completed" || s === "failed" ? false : 3000;
    },
  });

  async function onDelete() {
    if (!confirm("Удалить задачу и файлы?")) return;
    try {
      await deleteJob(id);
      toast.success("Удалено");
      router.push("/jobs");
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err?.message || "Не удалось удалить");
    }
  }

  if (!Number.isFinite(id)) {
    return (
      <PageContainer>
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Некорректная ссылка</AlertTitle>
          <AlertDescription>
            <Link href="/jobs" className="font-medium underline underline-offset-2 hover:text-foreground">
              К истории
            </Link>
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  if (isLoading || !job) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/jobs"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 text-muted-foreground transition-colors hover:text-foreground"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
          <JobStatusBadge status={job.status} />
        </div>

        <Card className="border-border/80 transition-shadow duration-200 hover:shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/10">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="break-words text-lg sm:text-xl">{job.filename}</CardTitle>
                <CardDescription>
                  {formatBytes(job.input_size)}
                  {job.output_size > 0 && ` → ${formatBytes(job.output_size)}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {job.status !== "failed" && (
              <JobProgress
                jobId={job.id}
                initialProgress={job.progress}
                initialPage={job.current_page}
                initialTotal={job.total_pages}
                initialStatus={job.status}
                onTerminal={(status, error) => {
                  qc.invalidateQueries({ queryKey: ["job", id] });
                  qc.invalidateQueries({ queryKey: ["jobs"] });
                  if (status === "completed") {
                    toast.success("Готово");
                  } else {
                    toast.error(error || "Ошибка");
                  }
                }}
              />
            )}

            {job.status === "failed" && (
              <Alert variant="destructive">
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap text-destructive-foreground/90">
                  {job.error || "Неизвестная ошибка"}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex flex-wrap gap-2">
              {job.status === "completed" && (
                <a
                  href={downloadUrl(job.id)}
                  download={job.filename.replace(/\.pdf$/i, "") + ".ocr.pdf"}
                  className={cn(
                    buttonVariants(),
                    "min-h-10 no-underline transition-opacity hover:opacity-90"
                  )}
                >
                  <Download className="h-4 w-4" />
                  Скачать PDF
                </a>
              )}
              <Button
                type="button"
                variant="outline"
                className="transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
