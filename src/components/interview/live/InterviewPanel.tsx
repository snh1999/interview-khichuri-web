import {
  ArrowLeftIcon,
  ChatCircleDotsIcon,
  RobotIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { generatePath, Link } from "react-router";
import { useSessionQuery } from "@/api/sessions/index.ts";
import { SESSION_DETAIL_PAGE } from "@/app.constants.ts";
import { CameraPreview } from "@/components/interview/live/CameraPreview.tsx";
import { QuestionClock } from "@/components/interview/live/QuestionClock.tsx";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import { useInterviewStore } from "@/store/interviewStore";
import type { IInterviewTimingRefs } from "./QuestionClock";

const CAMERA_WIDTH_MIN = 300;
const CAMERA_WIDTH_DEFAULT = 400;
const MIN_CHAT_WIDTH = 400;

interface ICameraPanelProps extends IInterviewTimingRefs {
  sessionId: string;
  chatSlot?: ReactNode;
  children?: ReactNode;
}

export const InterviewPanel = ({
  sessionId,
  startRef,
  pausedAccumRef,
  totalElapsedRef,
  chatSlot,
  children,
}: Readonly<ICameraPanelProps>) => {
  const panes = useInterviewStore((state) => state.panes);
  const toggleCamera = useInterviewStore((state) => state.toggleCamera);
  const toggleAvatar = useInterviewStore((state) => state.toggleAvatar);
  const toggleChat = useInterviewStore((state) => state.toggleChat);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { data: session } = useSessionQuery(sessionId);

  const sessionTitle = session?.title?.trim() || "Mock interview";

  const backLink = (
    <Link
      aria-label="Back to session"
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      title="Back to session"
      to={generatePath(SESSION_DETAIL_PAGE, { sessionId })}
    >
      <ArrowLeftIcon className="size-4" />
    </Link>
  );

  const cameraToggleButton = (
    <Button
      aria-label={panes.camera ? "Hide camera" : "Show camera"}
      onClick={toggleCamera}
      size="icon"
      title={panes.camera ? "Hide camera" : "Show camera"}
      variant={panes.camera ? "default" : "outline"}
    >
      <VideoCameraIcon className="size-4" />
    </Button>
  );

  const avatarToggleButton = (
    <Button
      aria-label={panes.avatar ? "Hide AI avatar" : "Show AI avatar"}
      onClick={toggleAvatar}
      size="icon"
      title={panes.avatar ? "Hide AI avatar" : "Show AI avatar"}
      variant={panes.avatar ? "default" : "outline"}
    >
      <RobotIcon className="size-4" />
    </Button>
  );

  const chatToggleButton = (
    <Button
      aria-label={panes.chat ? "Hide chat" : "Show chat"}
      onClick={toggleChat}
      size="icon"
      title={panes.chat ? "Hide chat" : "Show chat"}
      variant={panes.chat ? "default" : "outline"}
    >
      <ChatCircleDotsIcon className="size-4" />
    </Button>
  );

  const header = (
    <header className="flex items-center justify-between gap-2 border-border border-b px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {backLink}
        <p className="min-w-0 truncate font-medium text-xs">{sessionTitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <div className="pr-2">
          <QuestionClock
            pausedAccumRef={pausedAccumRef}
            startRef={startRef}
            totalElapsedRef={totalElapsedRef}
          />
        </div>
        {cameraToggleButton}
        {avatarToggleButton}
        {chatToggleButton}
      </div>
    </header>
  );

  const stage = (
    <div className="flex h-full min-h-0 flex-col">
      {panes.camera ? (
        <div className="flex h-[clamp(150px,42%,380px)] min-h-0 shrink-0 flex-col px-3 pb-3">
          <CameraPreview />
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );

  const chatPane = (
    <div className="flex h-full min-h-0 min-w-0 flex-col">{chatSlot}</div>
  );

  if (!(panes.camera || panes.avatar)) {
    return (
      <div className="flex h-full min-h-0 w-full overflow-hidden">
        <div className="flex min-w-14 shrink-0 flex-col items-center gap-1 border-border border-r bg-muted/40 py-2">
          {backLink}
          <div className="my-1 p-1">
            <QuestionClock
              hideIcon
              pausedAccumRef={pausedAccumRef}
              startRef={startRef}
              totalElapsedRef={totalElapsedRef}
            />
          </div>
          {cameraToggleButton}
          {avatarToggleButton}
          {chatToggleButton}
        </div>
        {chatPane}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {header}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {stage}
        </div>
        {panes.chat ? (
          <div className="flex min-h-0 flex-[1.2] flex-col overflow-hidden border-border border-t">
            {chatPane}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          className="bg-muted/40"
          defaultSize={CAMERA_WIDTH_DEFAULT}
          minSize={CAMERA_WIDTH_MIN}
        >
          <div className="flex h-full min-h-0 flex-col">
            {header}
            {stage}
          </div>
        </ResizablePanel>
        {panes.chat ? (
          <>
            <ResizableHandle
              aria-label="Resize camera panel"
              className="w-1 bg-border hover:bg-primary/40"
            />
            <ResizablePanel minSize={MIN_CHAT_WIDTH}>{chatPane}</ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
    </div>
  );
};
