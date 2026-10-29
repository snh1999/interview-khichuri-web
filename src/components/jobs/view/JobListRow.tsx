import { BriefcaseIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { generatePath, useNavigate } from "react-router";
import { type IJobWithTrack, useFavoriteToggle } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { FitCircle } from "@/components/jobs/FitCircle.tsx";
import { getDateInfo, STATUS_LABEL } from "@/components/jobs/jobs.helpers";
import { Button } from "@/components/ui/button.tsx";
import { StatusBadge } from "@/components/ui/custom/StatusBadge.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { isUrgent } from "@/lib/utils";

export const JobListRow = ({
  job,
  hideFavorite = false,
  fit,
}: {
  job: IJobWithTrack;
  hideFavorite?: boolean;
  fit?: number;
}) => {
  const navigate = useNavigate();

  const { track } = job;
  const urgent = track.interviewDate
    ? isUrgent(track.interviewDate)
    : !track.appliedAt && isUrgent(job.deadline);
  const dateInfo = getDateInfo(job);

  const handleClick = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));

  const handleToggleFavorite = useFavoriteToggle(job.id, !track.isFavorite);

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
          <span
            className={cn(
              "flex flex-row items-center gap-1.5 font-medium",
              urgent ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {dateInfo}
          </span>
        </span>
      </ItemContent>
      <ItemActions>
        <span className="hidden">{fit ? <FitCircle score={fit} /> : null}</span>
        {hideFavorite ? null : (
          <FavoriteButton
            icon="pin"
            isFavorite={track.isFavorite}
            onToggle={handleToggleFavorite}
          />
        )}
        <StatusBadge label={STATUS_LABEL[track.status]} status={track.status} />

        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};
