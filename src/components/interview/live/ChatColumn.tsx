import { RobotIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { IInterviewQuestion } from "@/api/sessions/interviews.ts";
import { Bubble } from "@/components/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Message } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner.tsx";

interface IChatColumnProps {
  question: IInterviewQuestion | undefined;
  className?: string;
  isFetchingFollowUps: boolean;
  children?: ReactNode;
}

export const ChatColumn = ({
  question,
  isFetchingFollowUps,
  className,
  children,
}: Readonly<IChatColumnProps>) => (
  <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <Message align="left">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <RobotIcon className="size-4 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <Bubble variant="assistant">{question?.questionText}</Bubble>
            {question?.notes ? (
              <p className="pl-2 text-muted-foreground text-xs italic">
                Hint: {question.notes}
              </p>
            ) : null}
          </div>
        </div>
      </Message>

      {isFetchingFollowUps ? (
        <Marker role="status" variant="separator">
          <MarkerIcon>
            <Spinner />
          </MarkerIcon>
          <MarkerContent>Running tests</MarkerContent>
        </Marker>
      ) : null}
    </div>

    {children}
  </div>
);
