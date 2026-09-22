import { cn } from "cn";
import { generatePath, useNavigate } from "react-router";
import type { IJob } from "@/api/jobs";
import { useUpdateJob } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import {
  getDateInfo,
  JOB_STATUS_VARIANT,
  STATUS_LABEL,
} from "@/components/jobs/jobs.helpers";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";
import { StatusBadge } from "@/components/ui/custom/StatusBadge.tsx";
import { isUrgent } from "@/lib/utils";

export const JobCardGrid = ({ job }: { job: IJob }) => {
  const navigate = useNavigate();
  const updateJob = useUpdateJob();
  const urgent = job.interviewDate
    ? isUrgent(job.interviewDate)
    : !job.appliedAt && isUrgent(job.deadline);

  const variant = urgent ? "danger" : JOB_STATUS_VARIANT[job.status];

  const handleClick = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));

  const handleToggleFavorite = () =>
    updateJob.mutateAsync({
      id: job.id,
      isFavorite: !job.isFavorite,
    });

  return (
    <GutterCard className="pt-3" onClick={handleClick} variant={variant}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground text-md leading-tight">
            {job.title}
          </p>
          <p className="mt-0.5 truncate text-muted-foreground text-sm">
            {job.companyName}
            {job.location ? ` · ${job.location}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StatusBadge label={STATUS_LABEL[job.status]} status={job.status} />
          <FavoriteButton
            isFavorite={job.isFavorite}
            onToggle={handleToggleFavorite}
          />
        </div>
      </div>

      <p
        className={cn(
          "mt-2 text-xs",
          urgent ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {getDateInfo(job)}
      </p>
    </GutterCard>
  );
};
