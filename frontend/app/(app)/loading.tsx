import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <PageContainer className="space-y-6 py-0">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </PageContainer>
  );
}
