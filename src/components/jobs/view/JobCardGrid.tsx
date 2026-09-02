import { CalendarBlankIcon } from "@phosphor-icons/react";
import { generatePath, useNavigate } from "react-router";
import type { IJob } from "@/api/jobs";
import { useUpdateJob } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import {
  getDaysUntilDeadline,
  JOB_STATUS_BADGE_CLASS,
} from "@/components/jobs/jobs.helpers.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Card } from "@/components/ui/card.tsx";

const formatDeadline = (deadline?: string | null) => {
  const diffDays = getDaysUntilDeadline(deadline);
  if (diffDays === null) {
    return "No deadline";
  }
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
  const updateJob = useUpdateJob();
  const handleClick = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));

  const handleToggleFavorite = () =>
    updateJob.mutateAsync({
      id: job.id,
      isFavorite: !job.isFavorite,
    });

  return (
    <Card
      className="cursor-pointer gap-2 px-4 py-4"
      onClick={handleClick}
      size="sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-muted-foreground text-sm">
          {job.companyName}
        </span>
        <div className="flex items-center gap-1">
          <Badge className={`shrink-0 ${JOB_STATUS_BADGE_CLASS[job.status]}`}>
            {job.status}
          </Badge>
          <FavoriteButton
            isFavorite={job.isFavorite}
            onToggle={handleToggleFavorite}
          />
        </div>
      </div>

      <p className="truncate font-medium text-[15px]">{job.title}</p>

      <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <CalendarBlankIcon className="size-3.5" />
        {formatDeadline(job.deadline)}
      </p>
    </Card>
  );
};
