import type { TJobStatus } from "@/api/jobs";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "cn";

const STATUS_BADGE_CLASS: Record<TJobStatus, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  scheduled: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

interface IProps {
  status: TJobStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: Readonly<IProps>) => (
  <Badge className={cn("shrink-0", STATUS_BADGE_CLASS[status], className)}>
    {status}
  </Badge>
);
