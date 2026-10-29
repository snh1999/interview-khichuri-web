import {
  BriefcaseIcon,
  ClockIcon,
  PushPinIcon,
  QuestionIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { generatePath, useNavigate } from "react-router";
import { useJobQuery } from "@/api/jobs";
import {
  type IPrepSession,
  useDeleteSession,
  useQuestions,
} from "@/api/sessions";
import { JOB_DETAIL_PAGE, SESSIONS_PAGE } from "@/app.constants.ts";
import { PrepSessionForm } from "@/components/prep-session/session/PrepSessionForm.tsx";
import { getSessionTopicIds } from "@/components/prep-session/session.helpers.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useTopicsMap } from "@/hooks/useLookupMap";
import { formatDate } from "@/lib/date";

const DESC_PREVIEW_LENGTH = 220;

interface IProps {
  session: IPrepSession;
}

export const SessionInfoSection = ({ session }: IProps) => {
  const { data: questions } = useQuestions(session.id);
  const topicsMap = useTopicsMap();
  const navigate = useNavigate();
  const [descExpanded, setDescExpanded] = useState(false);

  const topics = getSessionTopicIds(session).flatMap((topicId) => {
    const topic = topicsMap.get(topicId);
    return topic ? [topic] : [];
  });

  const descriptionIsClipped =
    (session.description?.length ?? 0) > DESC_PREVIEW_LENGTH;
  const preview =
    session.description && descriptionIsClipped && !descExpanded
      ? `${session.description.slice(0, DESC_PREVIEW_LENGTH).trimEnd()}…`
      : session.description;

  const pinnedCount = questions.filter((q) => q.isFavorite).length;
  const updatedDate = formatDate(session.updatedAt);

  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = () => setDialogOpen(false);
  const toggleExpansion = () => setDescExpanded((e) => !e);

  const deleteSession = useDeleteSession();

  const handleDelete = async () =>
    deleteSession.mutateAsync(session.id, {
      onSuccess: () => navigate(SESSIONS_PAGE),
    });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="wrap-break-word text-xl">
            {session.title}
          </CardTitle>
          {session.jobId ? <JobDetails jobId={session.jobId} /> : null}
        </div>
        <CardAction className="space-x-2">
          <PrepSessionForm
            onOpenChange={setDialogOpen}
            onSuccess={closeDialog}
            open={dialogOpen}
            session={session}
            viewTrigger
          />
          <MutationButton
            actionLabel="Delete"
            aria-label="Delete session"
            dialogDescription="This will permanently delete this session and its questions."
            dialogTitle="Delete this session?"
            mutationFn={handleDelete}
            requireConfirmation
            variant="destructive"
          >
            <TrashIcon />
          </MutationButton>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
              <Badge key={topic.id} variant="secondary">
                {topic.name}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
          {session.experience ? (
            <span className="inline-flex items-center gap-1">
              <BriefcaseIcon className="size-3.5" />
              {session.experience}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <QuestionIcon className="size-3.5" />
            {questions.length} questions
          </span>
          <span className="inline-flex items-center gap-1">
            <PushPinIcon className="size-3.5" />
            {pinnedCount} pinned
          </span>
          <span className="ml-auto inline-flex items-center gap-1">
            <ClockIcon className="size-3.5" />
            Updated {updatedDate}
          </span>
        </div>
      </CardContent>

      {session.description ? (
        <CardFooter className="flex-col items-start gap-1 border-t pt-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {preview}
          </p>
          {descriptionIsClipped ? (
            <Button
              className="h-auto p-0 text-muted-foreground text-xs hover:text-foreground"
              onClick={toggleExpansion}
              variant="link"
            >
              {descExpanded ? "See less" : "See more"}
            </Button>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
};

const JobDetails = ({ jobId }: { jobId: string }) => {
  const { data: job } = useJobQuery(jobId);
  const navigate = useNavigate();

  if (!job) {
    return null;
  }

  const openJobDetail = () =>
    navigate(generatePath(JOB_DETAIL_PAGE, { jobId: job.id }));

  return (
    <CardDescription>
      <Button className="p-0 text-md" onClick={openJobDetail} variant="link">
        <BriefcaseIcon className="mr-1 size-3.5" />
        {job.companyName} - {job.title}
      </Button>
    </CardDescription>
  );
};
