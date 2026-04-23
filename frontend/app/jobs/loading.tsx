import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <PageContainer className="space-y-4 py-4">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </PageContainer>
  );
}
