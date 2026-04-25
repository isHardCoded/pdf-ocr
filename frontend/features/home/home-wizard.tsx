"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FileDropzone, OcrSettings, type OcrSettingsValue } from "@/features/ocr";
import { createJob } from "@/lib/api";
import { estimateOcrRange } from "@/lib/estimate-ocr";
import { labelLanguage, labelMode, labelOptimize } from "@/lib/ocr-labels";
import { formatBytes } from "@/lib/utils";

const defaultSettings: OcrSettingsValue = {
  language: "rus",
  optimize: 3,
  deskew: true,
  mode: "force_ocr",
};

export function HomeWizard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<OcrSettingsValue>(defaultSettings);
  const [submitting, setSubmitting] = useState(false);

  const estimate = file ? estimateOcrRange(file.size, settings.mode) : null;

  async function onSubmit() {
    if (!file) return;
    setSubmitting(true);
    try {
      const job = await createJob(file, settings);
      toast.success("Файл поставлен в обработку");
      router.push(`/jobs/${job.id}`);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err?.message || "Не получилось начать обработку. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  }

  return (
    <PageContainer size="narrow" className="space-y-8 py-2 sm:py-4">
      <header className="border-b border-border/50 pb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Распознать текст в PDF</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Загрузите документ — программа сделает из скана обычный PDF, из которого можно копировать текст.
        </p>
      </header>

      <div className="space-y-10 pb-2">
        <section className="space-y-3" aria-labelledby="upload-title">
          <h2 id="upload-title" className="text-lg font-medium leading-snug sm:text-xl">
            Загрузите файл
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Подойдёт любой PDF до 2 ГБ. Перетащите его в область ниже или выберите с компьютера.
          </p>
          <FileDropzone file={file} onFile={setFile} disabled={submitting} />
        </section>

        <section className="space-y-3" aria-labelledby="settings-title">
          <h2 id="settings-title" className="text-lg font-medium leading-snug sm:text-xl">
            Настройки
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Для большинства документов ничего менять не нужно. Если результат вас не устроит — загляните сюда ещё
            раз.
          </p>
          <OcrSettings value={settings} onChange={setSettings} disabled={submitting} />
        </section>

        {file && (
          <section className="space-y-3" aria-labelledby="summary-title">
            <h2 id="summary-title" className="text-lg font-medium leading-snug sm:text-xl">
              Перед запуском
            </h2>
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium sm:text-lg">Что будет обработано</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Файл</p>
                  <p className="mt-0.5 break-all font-medium">{file.name}</p>
                  <p className="text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <Separator />
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Язык текста</dt>
                    <dd className="mt-0.5">{labelLanguage(settings.language)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Как обрабатывать страницы</dt>
                    <dd className="mt-0.5">{labelMode(settings.mode)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Сжатие файла</dt>
                    <dd className="mt-0.5">{labelOptimize(settings.optimize)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Выровнять наклон страниц</dt>
                    <dd className="mt-0.5">{settings.deskew ? "да" : "нет"}</dd>
                  </div>
                </dl>
                <Separator />
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-3">
                  <p className="text-xs text-muted-foreground">Примерное время</p>
                  <p className="mt-1.5 text-foreground">
                    порядка {estimate?.pagesApprox} стр. · {estimate?.label}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground/90">
                    Зависит от размера файла и нагрузки на компьютер.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <div className="flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {file ? "Нажмите кнопку, когда всё готово." : "Сначала выберите PDF-файл."}
          </p>
          <Button
            type="button"
            size="lg"
            className="min-w-52 sm:min-w-56"
            disabled={!file || submitting}
            onClick={onSubmit}
          >
            {submitting ? (
              <Spinner
                size="sm"
                label="Отправляем файл"
                className="border-primary-foreground/30 border-t-primary-foreground"
              />
            ) : (
              "Начать распознавание"
            )}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
