import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { site } from "@/config/site";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `PDF OCR — ${site.tagline}`,
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
      >
        <Providers>
          <SiteHeader />
          <main className="flex flex-1 flex-col bg-grid py-10 md:py-14 lg:py-16">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
