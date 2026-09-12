import { ChecksIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface IAnswerInputProps {
  answer: string;
  onAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLast: boolean;
  onNext: () => void;
  onFinish: () => void;
  className?: string;
  floating?: boolean;
}

export const AnswerInput = ({
  answer,
  onAnswerChange,
  isLast,
  onNext,
  onFinish,
  className,
  floating = false,
}: Readonly<IAnswerInputProps>) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && answer.trim()) {
      e.preventDefault();
      if (isLast) {
        onFinish();
      } else {
        onNext();
      }
    }
  };

  return (
    <div
      className={cn(
        floating
          ? "shrink-0 rounded-xl border border-border bg-background p-4 shadow-xl"
          : "shrink-0 border-border border-t bg-background p-4",
        className
      )}
    >
      <div className="flex items-end gap-3">
        <Textarea
          aria-label="Your answer"
          className="min-h-0 flex-1 resize-none bg-background"
          id="interview-answer"
          onChange={onAnswerChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here..."
          rows={floating ? 2 : 5}
          value={answer}
        />
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isLast ? (
            <Button disabled={!answer.trim()} onClick={onFinish} size="icon">
              <ChecksIcon className="size-4" />
            </Button>
          ) : (
            <Button disabled={!answer.trim()} onClick={onNext} size="icon">
              <PaperPlaneRightIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
