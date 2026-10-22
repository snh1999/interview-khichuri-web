import type { TJobStatus } from "@/api/jobs";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "cn";

const STATUS_BADGE_CLASS: Record<TJobStatus, string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-signal-warning/10 text-signal-warning-foreground",
  scheduled: "bg-signal-success/10 text-signal-success-foreground",
  interviewed: "bg-secondary text-secondary-foreground",
  offer: "bg-signal-success/10 text-signal-success-foreground",
  rejected: "bg-signal-danger/10 text-signal-danger-foreground",
  // biome-ignore lint/style/useNamingConvention: value comes from the API
  not_selected: "bg-signal-danger/10 text-signal-danger-foreground",
  withdrawn: "bg-muted text-muted-foreground",
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
