"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/FileDropzone";
import { OcrSettings, OcrSettingsValue } from "@/components/OcrSettings";
import { createJob } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<OcrSettingsValue>({
    language: "rus",
    optimize: 3,
    deskew: true,
    mode: "skip_text",
  });

  async function onSubmit() {
    if (!file) return;
    setSubmitting(true);
    try {
      const job = await createJob(file, settings);
      toast.success("Задача создана — запускаю OCR");
      router.push(`/jobs/${job.id}`);
    } catch (e: any) {
      toast.error(e?.message || "Не удалось создать задачу");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          OCRmyPDF + Tesseract 5 · работает локально
        </div>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          Сделайте текст в PDF <span className="text-primary">копируемым</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Загрузите сканированный PDF — получите тот же документ, но с
          распознанным текстовым слоем. Оригинальные страницы не меняются,
          текст теперь можно выделять, копировать и искать.
        </p>
      </section>

      <FileDropzone file={file} onFile={setFile} disabled={submitting} />

      <div className="glass rounded-xl p-6">
        <h2 className="mb-4 text-base font-semibold">Настройки распознавания</h2>
        <OcrSettings
          value={settings}
          onChange={setSettings}
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!file || submitting}
          onClick={onSubmit}
          className="min-w-48"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Загружаем...
            </>
          ) : (
            <>Запустить OCR</>
          )}
        </Button>
      </div>
    </div>
  );
}
