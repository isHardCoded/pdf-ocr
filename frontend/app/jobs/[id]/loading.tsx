import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailLoading() {
  return (
    <PageContainer className="space-y-4 py-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </PageContainer>
  );
}
