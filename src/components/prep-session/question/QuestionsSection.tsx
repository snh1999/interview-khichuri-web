import {
  ArrowsInLineVerticalIcon,
  ArrowsOutLineVerticalIcon,
  DotsThreeVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { z } from "zod";
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
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate";

const questionCountSchema = z.coerce.number().int().min(1).max(50);

type QuestionFilter = "all" | "pinned" | "unanswered";

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QuestionFilter>("all");
  const [questionListParent] = useStrictSafeAutoAnimate();

  const [count, setCount] = useState(5);
  const [avoidRepeat, setAvoidRepeat] = useState<boolean>(true);
  const [includeJobDescription, setIncludeJobDescription] =
    useState<boolean>(false);

  const visibleQuestions = useMemo(
    () =>
      questions.filter((question) => {
        if (filter === "pinned" && !question.isFavorite) {
          return false;
        }
        if (filter === "unanswered" && question.answer) {
          return false;
        }
        return (
          search.trim().length === 0 ||
          question.questionText
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        );
      }),
    [questions, search, filter]
  );

  const handleGenerateQuestions = async (provider: string, model?: string) => {
    try {
      await generateQuestions({
        id: sessionId,
        provider,
        model,
        count: questionCountSchema.catch(5).parse(count),
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
    visibleQuestions.length > 0 &&
    visibleQuestions.every((q) => expandedIds.has(q.id));

  const toggleAllExpanded = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(visibleQuestions.map((q) => q.id)));
    }
  };

  const toggleExpanded = useCallback((questionId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const openAiDialog = () => setAiDialogOpen(true);
  const viewAddForm = () => setShowAddForm(true);
  const hideAddForm = () => setShowAddForm(false);
  const toggleNoteView = () => setShowNotes((state) => !state);

  useHotkeys(
    "escape",
    () => setShowAddForm(false),
    { enableOnFormTags: true, enabled: showAddForm },
    [showAddForm]
  );

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  );
  const handleCountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setCount(Number(e.target.value)),
    []
  );
  const handleFilterChange = useCallback((value: string[]) => {
    setFilter(value[0] as QuestionFilter);
  }, []);

  return (
    <>
      <Card className="px-1" id={sectionId}>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardAction className="flex gap-1">
            <Button onClick={openAiDialog}>Generate</Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button size="icon" variant="outline" />}
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
        <CardContent className="space-y-4">
          {showAddForm ? (
            <QuestionForm
              onCancel={hideAddForm}
              onSuccess={hideAddForm}
              sessionId={sessionId}
            />
          ) : null}

          {questions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="min-w-35 flex-1 text-md"
                onChange={handleSearchChange}
                placeholder="Search questions..."
                value={search}
              />
              <ToggleGroup
                className="*:rounded-full"
                onValueChange={handleFilterChange}
                value={[filter]}
                variant="outline"
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="pinned">Pinned</ToggleGroupItem>
                <ToggleGroupItem value="unanswered">Unanswered</ToggleGroupItem>
              </ToggleGroup>
            </div>
          ) : null}

          {visibleQuestions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {questions.length === 0
                    ? "No questions yet"
                    : " No questions match your filters."}
                </EmptyTitle>
                <EmptyDescription>
                  {questions.length === 0
                    ? " Generate questions with AI or add one manually."
                    : "Adjust your filter or Create new."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openAiDialog} size="sm">
                  Generate Questions
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3" ref={questionListParent}>
              {visibleQuestions.map((question) => (
                <QuestionCard
                  expanded={expandedIds.has(question.id)}
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
            onChange={handleCountChange}
            type="number"
            value={count}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={avoidRepeat}
            disabled={isQuestionPending}
            id="avoid-repeat"
            onCheckedChange={setAvoidRepeat}
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
              onCheckedChange={setIncludeJobDescription}
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
