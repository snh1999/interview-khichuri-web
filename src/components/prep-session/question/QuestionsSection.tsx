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
import {
  type IPrepSession,
  useGenerateQuestions,
  useQuestions,
} from "@/api/sessions";
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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

interface IProps {
  session: IPrepSession;
  sectionId: string;
}

export const QuestionsSection = ({ session, sectionId }: IProps) => {
  const sessionId = session.id;
  const { data: questions } = useQuestions(sessionId);
  const { mutateAsync: generateQuestions, isPending: isQuestionPending } =
    useGenerateQuestions();

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [count, setCount] = useState(5);
  const [avoidRepeat, setAvoidRepeat] = useState<boolean>(true);
  const [includeJobDescription, setIncludeJobDescription] =
    useState<boolean>(false);

  const handleGenerateQuestions = async (provider: string, model?: string) => {
    try {
      await generateQuestions({
        id: sessionId,
        provider,
        model,
        count,
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
  const openAiDialog = () => setAiDialogOpen(true);
  const viewAddForm = () => setShowAddForm(true);
  const hideAddForm = () => setShowAddForm(false);
  const toggleNoteView = () => setShowNotes((state) => !state);
  const handleJobCheckbox = (val: boolean) => setIncludeJobDescription(val);
  const handleQuestionCheckbox = (val: boolean) => setAvoidRepeat(val);
  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCount(Number(e.target.value));

  return (
    <>
      <Card className="px-1" id={sectionId}>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardAction className="flex gap-1">
            <Button onClick={openAiDialog} size="xs">
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
                  onClick={viewAddForm}
                >
                  <PlusIcon className="size-3" weight="bold" />
                  Add Question
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem closeOnClick={false} onClick={toggleNoteView}>
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
              onCancel={hideAddForm}
              onSuccess={hideAddForm}
              sessionId={sessionId}
            />
          ) : null}

          {questions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SparkleIcon />
                </EmptyMedia>
                <EmptyTitle>No questions yet</EmptyTitle>
                <EmptyDescription>
                  Generate questions with AI or add one manually.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openAiDialog} size="sm">
                  <SparkleIcon className="size-3" />
                  Generate Questions
                </Button>
              </EmptyContent>
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
        <div className="space-y-1.5">
          <Label htmlFor="question-count">Number of questions</Label>
          <Input
            disabled={isQuestionPending}
            id="question-count"
            max={50}
            min={1}
            onChange={handleQuestionCountChange}
            type="number"
            value={count}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={avoidRepeat}
            disabled={isQuestionPending}
            id="avoid-repeat"
            onCheckedChange={handleQuestionCheckbox}
          />
          <Label htmlFor="avoid-repeat">
            Avoid repeating previous questions
          </Label>
        </div>

        {session.jobId ? (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeJobDescription}
              disabled={isQuestionPending}
              id="include-job-description"
              onCheckedChange={handleJobCheckbox}
            />
            <Label htmlFor="include-job-description">
              Include job description
            </Label>
          </div>
        ) : null}
      </AiDialog>
    </>
  );
};
