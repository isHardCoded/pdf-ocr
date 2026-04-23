"use client";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "./ui/button";

interface Props {
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
}

export function FileDropzone({ file, onFile, disabled }: Props) {
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
      <div className="glass flex items-center justify-between rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onFile(null)}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group cursor-pointer rounded-xl border-2 border-dashed border-border bg-card/40 p-12 text-center transition-all hover:border-primary/60 hover:bg-primary/5",
        isDragActive && "border-primary bg-primary/10"
      )}
    >
      <input {...getInputProps()} />
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110">
        <UploadCloud className="h-7 w-7" />
      </div>
      <p className="text-lg font-medium">
        {isDragActive ? "Отпустите файл..." : "Перетащите PDF сюда"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        или нажмите, чтобы выбрать файл (до ~2 ГБ, 500–1000 страниц — это нормально)
      </p>
    </div>
  );
}
