import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import { FileText, History } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF OCR — копируемый текст из сканов",
  description:
    "Локальный конвертер PDF: делает сканированные страницы копируемыми через OCRmyPDF + Tesseract (русский).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-background text-foreground bg-grid antialiased">
        <Providers>
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold tracking-tight"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <FileText className="h-4 w-4" />
                </span>
                <span>PDF OCR</span>
                <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
                  · сканы → копируемый текст
                </span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/"
                  className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Загрузить
                </Link>
                <Link
                  href="/jobs"
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <History className="h-4 w-4" />
                  История
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
          <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
            Работает локально на вашем компьютере. Файлы не покидают машину.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
