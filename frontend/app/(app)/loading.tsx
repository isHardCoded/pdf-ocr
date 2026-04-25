import { PageContainer } from "@/components/layout";
import { PageSpinner } from "@/components/ui/spinner";

export default function AppLoading() {
  return (
    <PageContainer className="py-6">
      <PageSpinner minHeight="min-h-[18rem]" />
    </PageContainer>
  );
}
