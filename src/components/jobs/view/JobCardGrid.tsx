import { CalendarBlankIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router";
import type { IJob } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Card } from "@/components/ui/card.tsx";

const STATUS_BADGE: Record<IJob["status"], string> = {
  saved: "bg-secondary text-secondary-foreground",
  applied: "bg-blue-100 text-blue-700",
  scheduled: "bg-emerald-100 text-emerald-700",
};

const formatDeadline = (deadline: string | null) => {
  if (!deadline) {
    return "No deadline";
  }
  const diffDays = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) {
    return "Overdue";
  }
  if (diffDays === 0) {
    return "Deadline today";
  }
  return `Deadline in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
};

export const JobCardGrid = ({ job }: { job: IJob }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer gap-2 px-4 py-4"
      onClick={() => navigate(JOB_DETAIL_PAGE.replace(":id", job.id))}
      size="sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-muted-foreground text-sm">
          {job.companyName}
        </span>
        <Badge className={`shrink-0 ${STATUS_BADGE[job.status]}`}>
          {job.status}
        </Badge>
      </div>

      <p className="truncate font-medium text-[15px]">{job.title}</p>

      <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <CalendarBlankIcon className="size-3.5" />
        {formatDeadline(job.deadline)}
      </p>
    </Card>
  );
};
