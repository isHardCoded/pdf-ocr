import { PageContainer } from "@/components/layout";
import { PageSpinner } from "@/components/ui/spinner";

export default function JobsLoading() {
  return (
    <PageContainer className="py-6">
      <PageSpinner minHeight="min-h-[16rem]" />
    </PageContainer>
  );
}
