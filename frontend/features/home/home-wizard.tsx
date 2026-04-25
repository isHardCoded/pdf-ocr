"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

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

const stepMeta: readonly { n: 1 | 2 | 3; label: string; hint: string; sectionTitle: string; sectionBody: string }[] =
  [
    {
      n: 1,
      label: "Файл",
      hint: "загрузка",
      sectionTitle: "PDF для распознавания",
      sectionBody: "Перетащите файл в область ниже или нажмите, чтобы выбрать. До 2 ГБ.",
    },
    {
      n: 2,
      label: "Параметры",
      hint: "язык и режим",
      sectionTitle: "Параметры OCR",
      sectionBody: "Укажите язык, режим и оптимизацию. Значения по умолчанию подходят для сканов.",
    },
    {
      n: 3,
      label: "Старт",
      hint: "проверка",
      sectionTitle: "Проверка и запуск",
      sectionBody: "Убедитесь, что настройки верны, и запустите обработку.",
    },
  ];

function parseStep(raw: string | null): 1 | 2 | 3 {
  const n = Number(raw);
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 1;
}

export function HomeWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<OcrSettingsValue>(defaultSettings);
  const [submitting, setSubmitting] = useState(false);

  const meta = stepMeta[step - 1]!;

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
    <PageContainer size="narrow" className="space-y-8">
      <header className="border-b border-border/50 pb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Новая задача</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Шаг {step} из 3 · {meta.hint}
        </p>
      </header>

      <div
        className="rounded-2xl border border-border/60 bg-muted/15 p-4 sm:p-5"
        role="group"
        aria-label="Прогресс по шагам"
      >
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-left">
          Создание задачи
        </p>
        <StepperBar step={step} />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium leading-snug sm:text-xl">{meta.sectionTitle}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{meta.sectionBody}</p>
        </div>

        {step === 1 && (
          <section className="space-y-6" aria-labelledby="step1-title">
            <h3 id="step1-title" className="sr-only">
              Файл
            </h3>
            <FileDropzone file={file} onFile={setFile} disabled={submitting} />
            <div className="flex justify-end border-t border-border/40 pt-2">
              <Button
                type="button"
                size="lg"
                className="min-w-44"
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
            <h3 id="step2-title" className="sr-only">
              Параметры
            </h3>
            <OcrSettings value={settings} onChange={setSettings} disabled={submitting} />
            <div className="flex flex-col-reverse gap-3 border-t border-border/40 pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto sm:min-w-32"
                disabled={submitting}
                onClick={() => setStepWithUrl(1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button
                type="button"
                size="lg"
                className="w-full min-w-44 sm:w-auto"
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
            <h3 id="step3-title" className="sr-only">
              Старт
            </h3>
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium sm:text-lg">Сводка</CardTitle>
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
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-3">
                  <p className="text-xs text-muted-foreground">Ориентировочно</p>
                  <p className="mt-1.5 text-foreground">
                    ~{estimate?.pagesApprox} стр. · {estimate?.label}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground/90">
                    Зависит от объёма PDF и мощности CPU.
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col-reverse gap-3 border-t border-border/40 pt-4 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto sm:min-w-32"
                disabled={submitting}
                onClick={() => setStepWithUrl(2)}
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button
                type="button"
                size="lg"
                className="w-full min-w-48 sm:w-auto"
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
      </div>
    </PageContainer>
  );
}

function StepperBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol
      className="grid grid-cols-3 gap-1.5 sm:gap-3"
      role="list"
      aria-label="Три шага: файл, параметры, старт"
    >
      {stepMeta.map((s) => {
        const state: "upcoming" | "current" | "done" =
          step === s.n ? "current" : step > s.n ? "done" : "upcoming";
        return (
          <li key={s.n} className="min-w-0 list-none">
            <div
              className={cn(
                "flex h-full min-h-[7.5rem] flex-col items-center gap-1.5 rounded-xl border-2 px-1.5 py-3 text-center sm:min-h-0 sm:items-start sm:px-3 sm:py-4 sm:text-left",
                state === "current" &&
                  "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25 dark:ring-primary/20",
                state === "done" && "border-primary/35 bg-primary/5",
                state === "upcoming" && "border-border/50 bg-card/40"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-10 sm:w-10",
                  state === "current" && "bg-primary text-primary-foreground",
                  state === "done" && "bg-primary/20 text-primary",
                  state === "upcoming" && "border border-border/80 bg-muted/50 text-muted-foreground"
                )}
                aria-hidden
              >
                {state === "done" ? <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} /> : s.n}
              </span>
              <p
                className={cn(
                  "w-full min-w-0 text-xs font-semibold leading-tight sm:text-sm",
                  state === "current" ? "text-foreground" : "text-foreground/85"
                )}
              >
                {s.label}
              </p>
              <p className="w-full min-w-0 text-[10px] leading-snug text-muted-foreground sm:text-xs">{s.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
