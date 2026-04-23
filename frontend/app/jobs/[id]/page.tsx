"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Download, FileText, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobProgress } from "@/components/JobProgress";
import {
  deleteJob,
  downloadUrl,
  getJob,
  Job,
  previewUrl,
} from "@/lib/api";
import { formatBytes } from "@/lib/utils";

const PdfPreview = dynamic(
  () => import("@/components/PdfPreview").then((m) => m.PdfPreview),
  { ssr: false }
);

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

export default function JobPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const qc = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id),
    refetchInterval: (q) => {
      const s = (q.state.data as Job | undefined)?.status;
      return s === "completed" || s === "failed" ? false : 3000;
    },
  });

  if (isLoading || !job) {
    return (
      <div className="py-20 text-center text-muted-foreground">Загрузка...</div>
    );
  }

  async function onDelete() {
    if (!confirm("Удалить задачу и связанные файлы?")) return;
    try {
      await deleteJob(id);
      toast.success("Удалено");
      router.push("/jobs");
    } catch (e: any) {
      toast.error(e?.message || "Не удалось удалить");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Назад к истории
        </Link>
        {statusBadge(job.status)}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="break-all">{job.filename}</CardTitle>
              <CardDescription>
                Вход: {formatBytes(job.input_size)}
                {job.output_size > 0 &&
                  ` · Выход: ${formatBytes(job.output_size)}`}
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
                  toast.success("OCR завершён — можно скачивать!");
                } else {
                  toast.error(error || "OCR не удался");
                }
              }}
            />
          )}

          {job.status === "failed" && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
              <div className="font-semibold text-red-400">Ошибка OCR</div>
              <div className="mt-1 whitespace-pre-wrap text-red-200/80">
                {job.error || "Неизвестная ошибка"}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {job.status === "completed" && (
              <a
                href={downloadUrl(job.id)}
                download={job.filename.replace(/\.pdf$/i, "") + ".ocr.pdf"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                <Download className="h-4 w-4" /> Скачать результат
              </a>
            )}
            <Button variant="outline" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Удалить
            </Button>
          </div>
        </CardContent>
      </Card>

      {job.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Превью распознанного PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <PdfPreview url={previewUrl(job.id)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
