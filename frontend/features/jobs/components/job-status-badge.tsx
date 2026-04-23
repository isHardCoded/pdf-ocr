import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/api";

export function JobStatusBadge({ status }: { status: Job["status"] }) {
  switch (status) {
    case "completed":
      return <Badge variant="success">Готово</Badge>;
    case "failed":
      return <Badge variant="destructive">Ошибка</Badge>;
    case "running":
      return <Badge variant="default">В работе</Badge>;
    default:
      return <Badge variant="muted">В очереди</Badge>;
  }
}
