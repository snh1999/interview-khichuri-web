import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { generatePath, Link } from "react-router";
import { toast } from "sonner";
import {
  type IInterview,
  useArchiveLocalInterviewState,
  useClearLocalInterviewState,
  useCompleteInterview,
  useInterviewFollowUps,
  useLocalInterviewState,
  useSetLocalInterviewState,
} from "@/api/sessions/interviews.ts";
import { SESSION_DETAIL_PAGE } from "@/app.constants";
import { AiDialog } from "@/components/common/ai/AiDialog";
import { AnswerInput } from "@/components/interview/live/AnswerInput";
import { ChatColumn } from "@/components/interview/live/ChatColumn";
import { InterviewPanel } from "@/components/interview/live/InterviewPanel.tsx";
import { AvatarView } from "@/components/interview/live/speech/AvatarView.tsx";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import type {
  IInterviewTranscriptItem,
  ILocalInterviewState,
} from "@/lib/interviewStorage";
import { getLocalInterviewState } from "@/lib/interviewStorage";
import { useInterviewStore } from "@/store/interviewStore";
import { useInterviewTiming } from "./QuestionClock";

export const LiveInterview = ({ interview }: { interview: IInterview }) => {
  const { mutateAsync: completeInterview } = useCompleteInterview();
  const { mutateAsync: fetchFollowUps } = useInterviewFollowUps();
  const { mutateAsync: saveLocalDraft } = useSetLocalInterviewState();
  const { mutateAsync: archiveLocalDraft } = useArchiveLocalInterviewState();
  const { mutateAsync: clearLocalDraft } = useClearLocalInterviewState();

  const { data: storedDraft, isPending: isDraftPending } =
    useLocalInterviewState(interview.id);

  const [answer, setAnswer] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFetchingFollowUps, setIsFetchingFollowUps] = useState(false);
  const advancingRef = useRef(false);

  const panes = useInterviewStore((state) => state.panes);

  const {
    pausedAccumRef,
    startRef,
    totalElapsedRef,
    currentElapsed,
    elapsedClock,
    resetOnAdvance,
  } = useInterviewTiming(storedDraft?.currentIndex);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  useEffect(() => {
    const saved = storedDraft?.items[storedDraft.currentIndex]?.answer ?? "";
    if (saved.length > 0) {
      setAnswer((current) => current || saved);
    }
  }, [storedDraft]);

  const questionText =
    storedDraft?.questions[storedDraft.currentIndex]?.questionText ?? "";
  const nextQuestionText =
    storedDraft?.questions[storedDraft.currentIndex + 1]?.questionText ?? "";

  const questions = storedDraft?.questions ?? [];
  const items = storedDraft?.items ?? [];
  const currentIndex = storedDraft?.currentIndex ?? 0;
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const answerInput = (floating: boolean) => (
    <AnswerInput
      answer={answer}
      floating={floating}
      isLast={isLast}
      onAnswerChange={handleAnswerChange}
      onFinish={commitAndOpenEvaluate}
      onNext={goNext}
    />
  );

  const persistDraft = async (
    nextItems: IInterviewTranscriptItem[],
    nextIndex: number
  ): Promise<ILocalInterviewState | null> => {
    if (!storedDraft) {
      return null;
    }
    const next: ILocalInterviewState = {
      ...storedDraft,
      items: nextItems,
      currentIndex: nextIndex,
    };
    await saveLocalDraft(next);
    return next;
  };

  const commitCurrent = (): IInterviewTranscriptItem => ({
    questionId: currentIndex + 1,
    question: currentQuestion?.questionText ?? "",
    answer,
    seconds: currentElapsed(),
  });

  const fetchFollowUpsAndAppend = async (
    lastItem: IInterviewTranscriptItem
  ) => {
    setIsFetchingFollowUps(true);
    try {
      if (!storedDraft) {
        return;
      }
      const followUps = await fetchFollowUps({
        id: interview.id,
        provider: storedDraft.provider ?? "google",
        model: storedDraft.model,
        answers: [lastItem],
      });
      const latest = await getLocalInterviewState(interview.id);
      if (!latest) {
        return;
      }
      const existingIds = new Set(latest.questions.map((q) => q.questionText));
      const fresh = followUps.filter((q) => !existingIds.has(q.questionText));
      if (fresh.length === 0) {
        return;
      }
      const next: ILocalInterviewState = {
        ...latest,
        questions: [...latest.questions, ...fresh],
      };
      await saveLocalDraft(next);
      toast.success("Follow-up questions added");
    } catch {
      toast.error("Could not generate follow-up questions");
    } finally {
      setIsFetchingFollowUps(false);
    }
  };

  const goNext = async () => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: advancingRef guards re-entrancy across async ticks
    if (advancingRef.current) {
      return;
    }
    advancingRef.current = true;
    const item = commitCurrent();
    try {
      const nextItems = [...items];
      nextItems[currentIndex] = item;
      const nextIndex = currentIndex + 1;
      resetOnAdvance();
      const next = await persistDraft(nextItems, nextIndex);
      setAnswer(next?.items[nextIndex]?.answer ?? "");
    } finally {
      advancingRef.current = false;
    }

    if (interview.mode === "interview_flow") {
      // biome-ignore lint/complexity/noVoid: follow-up generation is intentionally fire-and-forget
      void fetchFollowUpsAndAppend(item);
    }
  };

  const commitAndOpenEvaluate = async () => {
    const item = commitCurrent();
    const nextItems = [...items];
    nextItems[currentIndex] = item;
    const next = await persistDraft(nextItems, currentIndex);
    if (next !== null) {
      setDialogOpen(true);
    }
  };

  const handleEvaluate = async (provider: string, model?: string) => {
    const answered = (storedDraft?.items ?? []).filter(
      (item) => item.answer.trim().length > 0
    );
    if (!storedDraft || answered.length === 0) {
      toast.error("No answers recorded yet");
      return;
    }
    setIsEvaluating(true);
    try {
      await completeInterview({
        id: interview.id,
        provider,
        model,
        transcript: answered,
        elapsedSeconds: elapsedClock(),
      });
      await archiveLocalDraft(storedDraft);
      await clearLocalDraft(interview.id);
      toast.success("Interview evaluated");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to evaluate interview");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isDraftPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!storedDraft || storedDraft.questions.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ArrowLeftIcon />
          </EmptyMedia>
          <EmptyTitle>No questions found</EmptyTitle>
          <EmptyDescription>
            Start a new mock interview from the session page to begin.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            render={
              <Link
                to={generatePath(SESSION_DETAIL_PAGE, {
                  sessionId: interview.sessionId,
                })}
              />
            }
            size="sm"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Session
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="-mt-6 -mr-4 -mb-6 -ml-4 flex h-[calc(100dvh-3rem)] flex-col sm:-mr-6 sm:-ml-6">
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <InterviewPanel
          chatSlot={
            <ChatColumn
              isFetchingFollowUps={isFetchingFollowUps}
              question={currentQuestion}
            >
              {answerInput(false)}
            </ChatColumn>
          }
          pausedAccumRef={pausedAccumRef}
          sessionId={interview.sessionId}
          startRef={startRef}
          totalElapsedRef={totalElapsedRef}
        >
          <div className="relative flex h-full min-h-0 flex-col">
            {panes.avatar ? (
              <AvatarView
                nextQuestionText={nextQuestionText}
                questionText={questionText}
              />
            ) : null}
            {panes.chat ? null : (
              <div className="absolute inset-x-4 bottom-4 z-20 flex justify-center">
                <div className="w-full max-w-2xl">{answerInput(true)}</div>
              </div>
            )}
          </div>
        </InterviewPanel>
      </div>

      <AiDialog
        description="Choose an AI provider to evaluate your interview."
        executeLabel="Evaluate"
        isLoading={isEvaluating}
        onExecute={handleEvaluate}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Evaluate Interview"
      />
    </div>
  );
};
