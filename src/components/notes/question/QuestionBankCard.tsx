import {
  CaretDownIcon,
  CaretUpIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
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
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible.tsx";
import {
  type IQuestionBankItem,
  QUESTION_BANK_CATEGORY_LABELS,
} from "@/lib/questions/question-bank.ts";

export const QuestionBankCard = ({
  item,
  onCreateNote,
}: {
  item: IQuestionBankItem;
  onCreateNote: (bankId: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((state) => !state);
  const handleCreateNote = () => onCreateNote(item.id);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="truncate text-md">{item.questions[0]}</CardTitle>
        <CardDescription className="space-x-2">
          <Badge variant="secondary">+{item.questions.length - 1} more</Badge>
          <Badge variant="outline">
            {QUESTION_BANK_CATEGORY_LABELS[item.category]}
          </Badge>
        </CardDescription>
        <CardAction className="flex items-center gap-1.5">
          <Button onClick={handleCreateNote} size="sm" type="button">
            <PlusCircleIcon />
            Note
          </Button>
          <Button
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse question" : "Expand question"}
            onClick={toggleExpanded}
            size="icon"
            type="button"
            variant="ghost"
          >
            {expanded ? <CaretUpIcon /> : <CaretDownIcon />}
          </Button>
        </CardAction>
      </CardHeader>

      <Collapsible onOpenChange={setExpanded} open={expanded}>
        <CollapsibleContent>
          <CardContent className="space-y-3 pb-4">
            {item.questions.length > 1 ? (
              <ul className="list-disc space-y-1 ps-4 text-sm">
                {item.questions.slice(1).map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>

          <CardFooter className="text-muted-foreground">
            {item.suggestions}
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
