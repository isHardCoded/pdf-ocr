import { PageContainer } from "@/components/layout";
import { PageSpinner } from "@/components/ui/spinner";

export default function JobDetailLoading() {
  return (
    <PageContainer className="py-6">
      <PageSpinner minHeight="min-h-[14rem]" />
    </PageContainer>
  );
}
