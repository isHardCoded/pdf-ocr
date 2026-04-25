import type { ReactNode } from "react";
import type { Metadata } from "next";

// Локальные woff2 из node_modules — `next build` в Docker не ходит в Google (иначе socket hang up)
import "@fontsource-variable/inter/wght.css";

import "./globals.css";
import { Providers } from "./providers";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `PDF OCR — ${site.tagline}`,
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex flex-1 flex-col bg-grid py-6 md:py-10 lg:py-12">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
