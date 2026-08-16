import {
  CaretDownIcon,
  CaretRightIcon,
  HeartIcon,
  NotePencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import {
  type IQuestion,
  useDeleteQuestion,
  useUpdateQuestion,
} from "@/api/sessions";
import { MarkdownContent } from "@/components/common/MarkdownContent.tsx";
import { QuestionForm } from "@/components/prep-session/question/QuestionForm.tsx";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
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
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const hideUpdateForm = () => setShowUpdateForm(false);
  const viewUpdateForm = () => setShowUpdateForm(true);

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

  if (showUpdateForm) {
    return (
      <Card className="border-border/50" size="sm">
        <CardContent>
          <QuestionForm
            onCancel={hideUpdateForm}
            onSuccess={hideUpdateForm}
            question={question}
            sessionId={sessionId}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible onOpenChange={handleOpenChange} open={expanded}>
      <Card className="border-border/50" size="sm">
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-start justify-between gap-2 text-left">
            <MarkdownContent content={question.questionText} />
            {expanded ? (
              <CaretDownIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            ) : (
              <CaretRightIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          <div className="flex shrink-0 items-center gap-1">
            <MutationButton
              errorMessage="Failed to pin question."
              mutationFn={handleUpdateQuestion}
              size="icon-sm"
              variant="ghost"
            >
              <HeartIcon
                className={`size-3 ${question.isFavorite ? "text-destructive" : "text-muted-foreground"}`}
                weight={question.isFavorite ? "fill" : "regular"}
              />
            </MutationButton>

            <Button
              onClick={viewUpdateForm}
              size="icon-sm"
              type="button"
              variant="ghost"
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
          </div>
        </CardHeader>
        <CollapsibleContent>
          {question.answer || question.notes ? (
            <CardContent className="flex flex-col gap-2 pt-0">
              {question.answer ? (
                <div>
                  <span className="text-muted-foreground text-xs">Answer:</span>
                  <MarkdownContent content={question.answer} />
                </div>
              ) : null}
              {showNotes && question.notes ? (
                <div>
                  <span className="text-muted-foreground text-xs">Notes:</span>

                  <div className="mt-0.5 text-xs">
                    <MarkdownContent content={question.notes} />
                  </div>
                </div>
              ) : null}
            </CardContent>
          ) : null}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
