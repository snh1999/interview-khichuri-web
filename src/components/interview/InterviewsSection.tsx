import { PlayIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { ISessionWithQuestions } from "@/api/sessions";
import {
  type IInterview,
  useClearInterviewArchive,
  useClearLocalInterviewState,
  useDeleteInterview,
  useGetSessionInterviews,
} from "@/api/sessions/interviews.ts";
import { InterviewItem } from "@/components/interview/InterviewItem.tsx";
import { AsyncButton } from "@/components/ui/button/AsyncButton.tsx";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { retryLocalEntryCleanup } from "@/lib/indexdb.ts";
import { CreateInterviewDialog } from "./CreateInterviewDialog.tsx";

interface IProps {
  sectionId: string;
  session: ISessionWithQuestions;
}

export const InterviewsSection = ({ sectionId, session }: IProps) => {
  const { data: interviews } = useGetSessionInterviews(session.id);
  const { mutateAsync: deleteInterview } = useDeleteInterview();
  const { mutateAsync: clearLocalInterviewState } =
    useClearLocalInterviewState();
  const { mutateAsync: clearInterviewArchive } = useClearInterviewArchive();

  const [dialogOpen, setDialogOpen] = useState(false);

  const startInterviewDialog = () => setDialogOpen(true);

  const handleDeleteInterview = async (interview: IInterview) => {
    const { id } = interview;
    await deleteInterview(id);
    await retryLocalEntryCleanup(id, [
      clearLocalInterviewState,
      clearInterviewArchive,
    ]);
  };

  return (
    <Card className="px-1" id={sectionId}>
      <CardHeader>
        <CardTitle>Mock Interviews</CardTitle>
        <CardAction>
          <AsyncButton onClick={startInterviewDialog}>
            <PlusCircleIcon />
            New Interview
          </AsyncButton>
        </CardAction>
      </CardHeader>

      {interviews.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No mock interviews yet</EmptyTitle>
            <EmptyDescription>
              Start a mock interview to practice and get AI feedback.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <AsyncButton onClick={startInterviewDialog}>
              <PlayIcon className="size-4" />
              Start Mock Interview
            </AsyncButton>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {interviews.map((interview) => (
            <InterviewItem
              interview={interview}
              key={interview.id}
              onDelete={handleDeleteInterview}
            />
          ))}
        </div>
      )}

      <CreateInterviewDialog
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        session={session}
      />
    </Card>
  );
};
