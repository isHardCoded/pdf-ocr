"use client";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  url: string;
}

export function PdfPreview({ url }: Props) {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const update = () => {
      const w = Math.min(900, window.innerWidth - 80);
      setWidth(w);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Текст теперь можно выделять и копировать прямо в превью.
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-20 text-center text-sm tabular-nums">
            {page} / {pages || "—"}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={pages === 0 || page >= pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-auto rounded-lg border border-border bg-white/5 p-4">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          loading={
            <div className="py-20 text-center text-muted-foreground">
              Загружаем превью...
            </div>
          }
          error={
            <div className="py-20 text-center text-red-400">
              Не удалось открыть PDF для превью.
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={width}
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>
      </div>
    </div>
  );
}
