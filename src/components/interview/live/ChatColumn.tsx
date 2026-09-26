import { RobotIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { IInterviewQuestion } from "@/api/sessions/interviews.ts";
import { Bubble } from "@/components/ui/bubble";
import { Message } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useStrictSafeAutoAnimate } from "@/hooks/useStrictSafeAutoAnimate";

interface IChatColumnProps {
  question: IInterviewQuestion | undefined;
  className?: string;
  liveFollowUps: IInterviewQuestion[];
  streamingFollowUps: boolean;
  children?: ReactNode;
}

export const ChatColumn = ({
  question,
  liveFollowUps,
  streamingFollowUps,
  className,
  children,
}: Readonly<IChatColumnProps>) => {
  const [listParent] = useStrictSafeAutoAnimate();

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      <div
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6"
        ref={listParent}
      >
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

        {streamingFollowUps ? (
          <Message align="left">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <RobotIcon className="size-4 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                {liveFollowUps.length === 0 ? (
                  <Bubble variant="assistant">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Spinner />
                      Preparing follow-ups…
                    </span>
                  </Bubble>
                ) : (
                  liveFollowUps.map((followUp, index) => (
                    <Bubble key={index.toString()} variant="assistant">
                      {followUp.questionText}
                      {streamingFollowUps &&
                      index === liveFollowUps.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="ml-1 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary align-middle"
                        />
                      ) : null}
                    </Bubble>
                  ))
                )}
              </div>
            </div>
          </Message>
        ) : null}
      </div>

      {children}
    </div>
  );
};
