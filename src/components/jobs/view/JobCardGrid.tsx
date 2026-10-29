import { cn } from "cn";
import { generatePath, useNavigate } from "react-router";
import { type IJobWithTrack, useFavoriteToggle } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { FitCircle } from "@/components/jobs/FitCircle.tsx";
import {
  getDateInfo,
  JOB_STATUS_VARIANT,
  STATUS_LABEL,
} from "@/components/jobs/jobs.helpers";
import { GutterCard } from "@/components/ui/custom/GutterCard.tsx";
import { StatusBadge } from "@/components/ui/custom/StatusBadge.tsx";
import { isUrgent } from "@/lib/utils";

interface IProps {
  job: IJobWithTrack;
  fit?: number;
}
export const JobCardGrid = ({ job, fit }: Readonly<IProps>) => {
  const navigate = useNavigate();
  const { track } = job;
  const urgent = track.interviewDate
    ? isUrgent(track.interviewDate)
    : !track.appliedAt && isUrgent(job.deadline);

  const variant = urgent ? "danger" : JOB_STATUS_VARIANT[track.status];

  const handleClick = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));

  const handleToggleFavorite = useFavoriteToggle(job.id, !track.isFavorite);

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
          <StatusBadge
            label={STATUS_LABEL[track.status]}
            status={track.status}
          />
          <FavoriteButton
            isFavorite={track.isFavorite}
            onToggle={handleToggleFavorite}
          />
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p
          className={cn(
            "text-xs",
            urgent ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {getDateInfo(job)}
        </p>
        <div className="hidden">{fit ? <FitCircle score={fit} /> : null}</div>
      </div>
    </GutterCard>
  );
};
