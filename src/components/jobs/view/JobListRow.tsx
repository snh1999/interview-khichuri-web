import {
  BriefcaseIcon,
  CalendarCheckIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { generatePath, useNavigate } from "react-router";
import type { IJob } from "@/api/jobs";
import { useUpdateJob } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { StatusBadge } from "@/components/ui/custom/status-badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { daysUntil, isUrgent } from "@/lib/utils";

const formatDeadline = (days: number | null) => {
  if (days === null) {
    return "—";
  }
  if (days < 0) {
    return "Deadline passed";
  }
  return `${days}d left`;
};

const pickListDate = (
  interviewDays: number | null,
  deadlineDays: number | null
): "interview" | "deadline" | null => {
  if (interviewDays === null && deadlineDays === null) {
    return null;
  }
  if (interviewDays === null) {
    return "deadline";
  }
  if (deadlineDays === null) {
    return "interview";
  }

  const interviewInFuture = interviewDays >= 0;
  const deadlineInFuture = deadlineDays >= 0;

  if (interviewInFuture !== deadlineInFuture) {
    return interviewInFuture ? "interview" : "deadline";
  }

  if (interviewInFuture) {
    return interviewDays <= deadlineDays ? "interview" : "deadline";
  }

  return interviewDays >= deadlineDays ? "interview" : "deadline";
};

export const JobListRow = ({
  job,
  hideFavorite = false,
}: {
  job: IJob;
  hideFavorite?: boolean;
}) => {
  const navigate = useNavigate();
  const updateJob = useUpdateJob();

  const deadlineDays = job.deadline ? daysUntil(job.deadline) : null;
  const interviewDays = job.interviewDate ? daysUntil(job.interviewDate) : null;
  const urgent = job.interviewDate
    ? isUrgent(job.interviewDate)
    : !job.appliedAt && isUrgent(job.deadline);
  const showListDate = pickListDate(interviewDays, deadlineDays);
  const interviewLabel = job.interviewDate
    ? new Date(job.interviewDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";

  const handleClick = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));

  const handleToggleFavorite = () =>
    updateJob.mutateAsync({
      id: job.id,
      isFavorite: !job.isFavorite,
    });

  return (
    <Item
      className="rounded-sm bg-muted/60"
      render={
        <Button className="h-auto" onClick={handleClick} variant="ghost" />
      }
    >
      <ItemContent className="min-w-0 gap-0.5 space-y-1.5">
        <ItemTitle className="min-w-0 flex-1 truncate text-sm">
          {job.title}
        </ItemTitle>

        <span className="flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground text-xs">
          <span className="flex min-w-0 flex-row items-center gap-1.5">
            <BriefcaseIcon className="size-3.5 shrink-0" />
            <span className="truncate">{job.companyName}</span>
          </span>
          {showListDate === "interview" ? (
            <span className="flex items-center gap-1.5">
              <CalendarCheckIcon className="size-3.5 shrink-0" />
              {interviewLabel}
            </span>
          ) : null}
          {showListDate === "deadline" ? (
            <span
              className={cn(
                "flex flex-row items-center gap-1.5 font-medium",
                urgent ? "text-rose-500" : "text-muted-foreground"
              )}
            >
              {formatDeadline(deadlineDays)}
            </span>
          ) : null}
        </span>
      </ItemContent>
      <ItemActions>
        {hideFavorite ? null : (
          <FavoriteButton
            icon="pin"
            isFavorite={job.isFavorite}
            onToggle={handleToggleFavorite}
          />
        )}
        <StatusBadge status={job.status} />

        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};
