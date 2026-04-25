"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileDropzone, OcrSettings, type OcrSettingsValue } from "@/features/ocr";
import { createJob } from "@/lib/api";
import { estimateOcrRange } from "@/lib/estimate-ocr";
import { labelLanguage, labelMode, labelOptimize } from "@/lib/ocr-labels";
import { cn, formatBytes } from "@/lib/utils";

const defaultSettings: OcrSettingsValue = {
  language: "rus",
  optimize: 3,
  deskew: true,
  mode: "force_ocr",
};

function parseStep(raw: string | null): 1 | 2 | 3 {
  const n = Number(raw);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

export function HomeWizard() {
  const router = useRouter();
  // Шаг из URL — через window, без useSearchParams (RSC/Next 15)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<OcrSettingsValue>(defaultSettings);
  const [submitting, setSubmitting] = useState(false);

  useLayoutEffect(() => {
    setStep(parseStep(new URLSearchParams(window.location.search).get("step")));
  }, []);

  const setStepWithUrl = useCallback(
    (s: 1 | 2 | 3) => {
      setStep(s);
      const next = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      if (s === 1) next.delete("step");
      else next.set("step", String(s));
      const q = next.toString();
      router.replace(q ? `/?${q}` : "/", { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    if ((step === 2 || step === 3) && !file) setStepWithUrl(1);
  }, [step, file, setStepWithUrl]);

  async function onSubmit() {
    if (!file) return;
    setSubmitting(true);
    try {
      const job = await createJob(file, settings);
      toast.success("Задача создана");
      router.push(`/jobs/${job.id}`);
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err?.message || "Не удалось создать задачу");
      setSubmitting(false);
    }
  }

  const estimate = file ? estimateOcrRange(file.size, settings.mode) : null;

  return (
    <PageContainer size="narrow" className="space-y-8 py-2">
      <header className="space-y-4 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" aria-hidden />
          Локально · без облака
        </div>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Новая задача OCR
        </h1>
        <StepIndicator step={step} />
      </header>

      {step === 1 && (
        <section className="space-y-6" aria-labelledby="step1-title">
          <h2 id="step1-title" className="sr-only">
            Шаг 1: файл
          </h2>
          <FileDropzone file={file} onFile={setFile} disabled={submitting} />
          <div className="flex justify-end">
            <Button
              type="button"
              size="lg"
              className="min-w-40"
              disabled={!file || submitting}
              onClick={() => setStepWithUrl(2)}
            >
              Далее
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6" aria-labelledby="step2-title">
          <h2 id="step2-title" className="sr-only">
            Шаг 2: параметры
          </h2>
          <OcrSettings value={settings} onChange={setSettings} disabled={submitting} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="sm:min-w-32"
              disabled={submitting}
              onClick={() => setStepWithUrl(1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-w-40"
              disabled={submitting}
              onClick={() => setStepWithUrl(3)}
            >
              Далее
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {step === 3 && file && (
        <section className="space-y-6" aria-labelledby="step3-title">
          <h2 id="step3-title" className="sr-only">
            Шаг 3: подтверждение
          </h2>
          <Card className="border-border/80 transition-shadow hover:shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Проверьте и запустите</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Файл</p>
                <p className="mt-0.5 font-medium break-all">{file.name}</p>
                <p className="text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <Separator />
              <dl className="grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Язык</dt>
                  <dd className="mt-0.5">{labelLanguage(settings.language)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Режим</dt>
                  <dd className="mt-0.5">{labelMode(settings.mode)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Сжатие</dt>
                  <dd className="mt-0.5">{labelOptimize(settings.optimize)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Deskew</dt>
                  <dd className="mt-0.5">{settings.deskew ? "да" : "нет"}</dd>
                </div>
              </dl>
              <Separator />
              <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Ориентировочное время</p>
                <p className="mt-1 text-foreground">
                  ~{estimate?.pagesApprox} стр. (оценка по размеру) · {estimate?.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Зависит от числа страниц, разрешения скана и нагрузки на CPU.
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="sm:min-w-32"
              disabled={submitting}
              onClick={() => setStepWithUrl(2)}
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-w-48"
              disabled={submitting}
              onClick={onSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Отправка…
                </>
              ) : (
                <>
                  Запустить OCR
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </section>
      )}
    </PageContainer>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps: { n: 1 | 2 | 3; label: string }[] = [
    { n: 1, label: "Файл" },
    { n: 2, label: "Параметры" },
    { n: 3, label: "Старт" },
  ];
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Шаги">
      {steps.map(({ n, label }, idx) => (
        <li key={n} className="flex items-center gap-2">
          {idx > 0 && (
            <span
              className="hidden h-px w-4 bg-border sm:block"
              aria-hidden
            />
          )}
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors",
              step === n
                ? "border-primary bg-primary text-primary-foreground"
                : step > n
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground"
            )}
          >
            {n}
          </span>
          <span
            className={cn(
              "hidden text-xs sm:inline",
              step === n ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
