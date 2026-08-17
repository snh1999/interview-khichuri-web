import { CaretRightIcon, HeartIcon } from "@phosphor-icons/react";
import { generatePath, useNavigate } from "react-router";
import type { IJob, TJobStatus } from "@/api/jobs";
import { useUpdateJob } from "@/api/jobs";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item.tsx";

const STATUS_DOT: Record<TJobStatus, string> = {
  saved: "bg-muted-foreground",
  applied: "bg-blue-500",
  scheduled: "bg-emerald-500",
};

const formatDeadline = (deadline?: string | null) => {
  if (!deadline) {
    return "—";
  }
  const diffDays = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) {
    return "Overdue";
  }
  if (diffDays === 0) {
    return "Today";
  }
  return `${diffDays}d left`;
};

export const JobListRow = ({ job }: { job: IJob }) => {
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
    <Item
      className="py-3"
      render={
        <Button className="h-auto" onClick={handleClick} variant="ghost" />
      }
      size="sm"
    >
      <ItemMedia>
        <span
          className={`size-2 shrink-0 rounded-full ${STATUS_DOT[job.status]}`}
        />
      </ItemMedia>
      <ItemContent className="min-w-0 flex-row items-center gap-3">
        <ItemTitle className="min-w-0 flex-1 truncate">
          {job.title} — {job.companyName}
        </ItemTitle>
        <span className="shrink-0 whitespace-nowrap text-muted-foreground text-xs">
          {formatDeadline(job.deadline)}
        </span>
      </ItemContent>
      <ItemActions>
        <MutationButton
          errorMessage="Failed to update favorite."
          mutationFn={handleToggleFavorite}
          size="icon-sm"
          variant="ghost"
        >
          <HeartIcon
            className={`size-3 ${job.isFavorite ? "text-destructive" : "text-muted-foreground"}`}
            weight={job.isFavorite ? "fill" : "regular"}
          />
        </MutationButton>
        <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
};
