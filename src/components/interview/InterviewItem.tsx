import { TrashIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { generatePath, Link } from "react-router";
import {
  type IInterview,
  useLocalInterviewState,
} from "@/api/sessions/interviews.ts";
import { INTERVIEW_PAGE } from "@/app.constants.ts";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { GutterCard } from "@/components/ui/custom/gutter-card.tsx";

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatDuration = (seconds: number | null | undefined) => {
  const total = seconds ?? 0;
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}m ${remaining}s`;
};

const SCORE_TIER_TEXT = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
} as const;

const SCORE_TIER = (score: number) => {
  if (score >= 80) {
    return "success";
  }
  if (score >= 60) {
    return "warning";
  }
  return "danger";
};

interface IProps {
  interview: IInterview;
  onDelete: (interview: IInterview) => Promise<void>;
}

export const InterviewItem = ({ interview, onDelete }: IProps) => {
  const {
    completedAt,
    createdAt,
    elapsedSeconds,
    id,
    overallScore,
    startedAt,
  } = interview;
  const { data: stored } = useLocalInterviewState(id, !completedAt);
  const handleDelete = () => onDelete(interview);
  const answerCount = stored
    ? stored.items.filter((item) => item.answer.trim().length > 0).length
    : 0;

  const isCompleted = !!completedAt;
  const hasAnswers = answerCount > 0;
  const score = overallScore ?? 0;

  let title: string;
  let subtitle: string | null = null;

  if (isCompleted) {
    title = `Completed · ${formatDate(completedAt)}`;
    subtitle = formatDuration(elapsedSeconds);
  } else if (hasAnswers) {
    title = `In progress · ${formatDate(startedAt)}`;
    subtitle = `${answerCount} answered`;
  } else {
    title = `Created · ${formatDate(createdAt)}`;
  }

  return (
    <GutterCard
      className="flex items-center border-y border-r py-4"
      variant={isCompleted ? SCORE_TIER(score) : "default"}
    >
      <Link
        className="flex min-w-0 flex-1 items-center justify-between gap-3"
        to={generatePath(INTERVIEW_PAGE, {
          interviewId: id,
        })}
      >
        <div className="min-w-0">
          <p className="font-medium text-[13px] text-foreground">{title}</p>
          {subtitle ? (
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {isCompleted && (
          <p
            className={cn(
              "shrink-0 font-semibold text-[18px]",
              SCORE_TIER_TEXT[SCORE_TIER(score)]
            )}
          >
            {score}
          </p>
        )}
      </Link>
      <MutationButton
        className="ml-4"
        dialogDescription="This will permanently delete this mock interview and its transcript."
        errorMessage="Failed to delete mock interview"
        mutationFn={handleDelete}
        requireConfirmation
        successMessage="Mock interview deleted"
        variant="destructive"
      >
        <TrashIcon className="size-3.5" />
        Delete
      </MutationButton>
    </GutterCard>
  );
};
