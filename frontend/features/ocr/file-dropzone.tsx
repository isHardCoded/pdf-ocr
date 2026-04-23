"use client";

import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileDropzoneProps {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({ file, onFile, disabled, className }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
    disabled: disabled || !!file,
    onDrop: (accepted) => {
      if (accepted[0]) onFile(accepted[0]);
    },
  });

  if (file) {
    return (
      <Card
        className={cn(
          "overflow-hidden border-border/70 transition-shadow duration-200 hover:shadow-sm",
          className
        )}
      >
        <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onFile(null)}
            disabled={disabled}
            title="Снять выбор"
            className="shrink-0"
            aria-label="Снять выбор файла"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed border-border/70 bg-card/20 p-8 text-center transition-all duration-200",
          "hover:border-primary/40 hover:bg-primary/[0.03]",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          isDragActive && "border-primary bg-primary/10"
        )}
      >
        <input {...getInputProps()} />
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15"
          aria-hidden
        >
          <UploadCloud className="h-7 w-7" />
        </div>
        <p className="text-base font-medium">
          {isDragActive ? "Отпустите файл сюда" : "Перетащите PDF в эту область"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">или нажмите, чтобы выбрать с диска</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Крупные файлы (сотни страниц) поддерживаются. Ограничение — свободное место на диске.
        </p>
      </div>
    </div>
  );
}
