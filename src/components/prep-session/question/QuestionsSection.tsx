import {
  ArrowsInLineVerticalIcon,
  ArrowsOutLineVerticalIcon,
  DotsThreeVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGenerateQuestions, useQuestions } from "@/api/sessions";
import { AiDialog } from "@/components/common/ai/AiDialog.tsx";
import { QuestionCard } from "@/components/prep-session/question/QuestionCard.tsx";
import { QuestionForm } from "@/components/prep-session/question/QuestionForm.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Label } from "@/components/ui/label.tsx";

interface IProps {
  sessionId: string;
  sectionId: string;
}

export const QuestionsSection = ({ sessionId, sectionId }: IProps) => {
  const { data: questions } = useQuestions(sessionId);
  const { mutateAsync: generateQuestions, isPending: isQuestionPending } =
    useGenerateQuestions();

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [avoidRepeat, setAvoidRepeat] = useState<boolean>(true);
  const [includeJobDescription, setIncludeJobDescription] =
    useState<boolean>(false);

  const handleGenerateQuestions = async (provider: string, model?: string) => {
    try {
      await generateQuestions({
        id: sessionId,
        provider,
        model,
        avoidRepeat,
        includeJobDescription,
      });
      toast.success("Questions generated");
    } catch {
      toast.error("Failed to generate questions");
    } finally {
      setAiDialogOpen(false);
    }
  };

  const allExpanded =
    questions.length > 0 && questions.every((q) => expandedIds.has(q.id));

  const toggleAllExpanded = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const toggleExpanded = (questionId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const isCardExpanded = (questionId: number) => expandedIds.has(questionId);

  return (
    <>
      <Card className="px-1" id={sectionId}>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardAction className="flex gap-1">
            <Button onClick={() => setAiDialogOpen(true)} size="xs">
              <SparkleIcon className="size-3" />
              Generate
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="icon-xs" variant="outline" />}
              >
                <DotsThreeVerticalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="whitespace-nowrap"
                  onClick={() => setShowAddForm(true)}
                >
                  <PlusIcon className="size-3" weight="bold" />
                  Add Question
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  closeOnClick={false}
                  onClick={() => setShowNotes((state) => !state)}
                >
                  {showNotes ? (
                    <EyeSlashIcon className="size-3" />
                  ) : (
                    <EyeIcon className="size-3" />
                  )}
                  {showNotes ? "Hide Notes" : "Show Notes"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  closeOnClick={false}
                  onClick={toggleAllExpanded}
                >
                  {allExpanded ? (
                    <ArrowsInLineVerticalIcon className="size-3" />
                  ) : (
                    <ArrowsOutLineVerticalIcon className="size-3" />
                  )}
                  {allExpanded ? "Collapse All" : "Expand All"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          {showAddForm ? (
            <QuestionForm
              onCancel={() => setShowAddForm(false)}
              onSuccess={() => setShowAddForm(false)}
              sessionId={sessionId}
            />
          ) : null}

          {questions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No questions yet</EmptyTitle>
                <EmptyDescription>
                  Add your first question to start practicing.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {questions.map((question) => (
                <QuestionCard
                  expanded={isCardExpanded(question.id)}
                  key={question.id}
                  onToggleExpanded={toggleExpanded}
                  question={question}
                  showNotes={showNotes}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AiDialog
        description="Choose an AI provider to generate questions for this session."
        executeLabel="Generate"
        isLoading={isQuestionPending}
        onExecute={handleGenerateQuestions}
        onOpenChange={setAiDialogOpen}
        open={aiDialogOpen}
        title="Generate Questions"
      >
        <div className="flex items-center gap-2">
          <Checkbox
            checked={avoidRepeat}
            disabled={isQuestionPending}
            id="avoid-repeat"
            onCheckedChange={(val) => setAvoidRepeat(val)}
          />
          <Label htmlFor="avoid-repeat">
            Avoid repeating previous questions
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={includeJobDescription}
            disabled={isQuestionPending}
            id="include-job-description"
            onCheckedChange={(val) => setIncludeJobDescription(val)}
          />
          <Label htmlFor="include-job-description">
            Include job description
          </Label>
        </div>
      </AiDialog>
    </>
  );
};
