"use client";

import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { HomeWizard } from "./home-wizard";

function WizardFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Skeleton className="mx-auto h-8 w-64" />
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-10 w-32 self-end" />
    </div>
  );
}

export function HomeView() {
  return (
    <Suspense fallback={<WizardFallback />}>
      <HomeWizard />
    </Suspense>
  );
}
