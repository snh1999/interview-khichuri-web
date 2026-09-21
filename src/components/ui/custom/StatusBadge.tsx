import type { TJobStatus } from "@/api/jobs";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "cn";

const STATUS_BADGE_CLASS: Record<TJobStatus, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-signal-warning/10 text-signal-warning-foreground",
  scheduled: "bg-signal-success/10 text-signal-success-foreground",
};

interface IProps {
  status: TJobStatus;
  className?: string;
  label?: string;
}

export const StatusBadge = ({ status, className, label }: Readonly<IProps>) => (
  <Badge className={cn("shrink-0", STATUS_BADGE_CLASS[status], className)}>
    {label ?? status}
  </Badge>
);
