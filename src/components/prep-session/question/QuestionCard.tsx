import {
  CaretDownIcon,
  CaretRightIcon,
  NotePencilIcon,
  PenIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  type IQuestion,
  useDeleteQuestion,
  useUpdateQuestion,
} from "@/api/sessions";
import { FavoriteButton } from "@/components/common/FavoriteButton.tsx";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { QuestionForm } from "@/components/prep-session/question/QuestionForm.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.tsx";
import { useSessionId } from "@/hooks/useId.ts";

interface IProps {
  question: IQuestion;
  expanded: boolean;
  showNotes: boolean;
  onToggleExpanded: (id: number) => void;
}

export const QuestionCard = ({
  question,
  expanded,
  showNotes,
  onToggleExpanded,
}: Readonly<IProps>) => {
  const sessionId = useSessionId();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [viewAnswer, setViewAnswer] = useState(false);
  const [viewNotes, setViewNotes] = useState(false);
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const hideUpdateForm = () => setShowUpdateForm(false);
  const viewUpdateForm = () => setShowUpdateForm(true);

  useHotkeys(
    "escape",
    () => setShowUpdateForm(false),
    { enableOnFormTags: true, enabled: showUpdateForm },
    [showUpdateForm]
  );

  const handleOpenChange = () => {
    onToggleExpanded(question.id);
  };

  const handleUpdateQuestion = () =>
    updateQuestion.mutateAsync({
      sessionId,
      questionId: question.id,
      isFavorite: !question.isFavorite,
    });

  const handleDeleteQuestion = () =>
    deleteQuestion.mutateAsync({
      questionId: question.id,
      sessionId,
    });

  const toggleViewAnswer = () => setViewAnswer((v) => !v);
  const toggleViewNote = () => setViewNotes((v) => !v);

  const openAnswer = expanded || viewAnswer;
  const openNotes = (expanded && showNotes) || viewNotes;

  if (showUpdateForm) {
    return (
      <QuestionForm
        onCancel={hideUpdateForm}
        onSuccess={hideUpdateForm}
        question={question}
        sessionId={sessionId}
      />
    );
  }

  return (
    <Card size="sm">
      <button
        className="px-4 text-left text-sm"
        onClick={handleOpenChange}
        type="button"
      >
        <MarkdownContent content={question.questionText} />
      </button>

      <CardHeader className="flex w-full items-start justify-between gap-3 py-0 text-left">
        <div className="flex gap-2">
          <Button onClick={handleOpenChange} size="icon-sm" variant="ghost">
            {expanded ? <CaretDownIcon /> : <CaretRightIcon />}
          </Button>

          {!expanded && question.answer ? (
            <Button onClick={toggleViewAnswer} size="sm" variant="outline">
              {viewAnswer ? "Hide answer" : "Answered"}
            </Button>
          ) : null}

          {!expanded && question.notes ? (
            <Button onClick={toggleViewNote} size="sm" variant="outline">
              {viewNotes ? "Hide notes" : "Has notes"}
            </Button>
          ) : null}
        </div>

        <CardAction className="space-x-1.5">
          <FavoriteButton
            icon="pin"
            isFavorite={question.isFavorite}
            onToggle={handleUpdateQuestion}
          />

          <Button
            onClick={viewUpdateForm}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <NotePencilIcon className="size-3" />
          </Button>

          <MutationButton
            dialogDescription="This operation will delete the question."
            errorMessage="Failed to delete question"
            mutationFn={handleDeleteQuestion}
            requireConfirmation
            size="icon-sm"
            successMessage="Question deleted"
            variant="destructive"
          >
            <TrashIcon />
          </MutationButton>
        </CardAction>
      </CardHeader>

      {openAnswer && question.answer ? (
        <CardContent className="bg-primary/10 pt-2">
          <MarkdownContent content={question.answer} />
        </CardContent>
      ) : null}

      {openNotes && question.notes ? (
        <CardFooter>
          <Button
            className="mr-2 h-auto flex-col py-0.5"
            disabled
            size="xs"
            variant="outline"
          >
            <PenIcon />
            Note
          </Button>
          <MarkdownContent content={question.notes} />
        </CardFooter>
      ) : null}
    </Card>
  );
};
