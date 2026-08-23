// TODO: Restore CloudIcon import once Google OAuth calendar.events scope is approved
import {
  ArrowSquareOutIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { format, isSameDay } from "date-fns";
import { generatePath, useNavigate } from "react-router";
import { useDeleteCalendarEvent } from "@/api/calendar";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { Button } from "@/components/ui/button";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogClose,
  DrawLogContent,
  DrawLogDescription,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog";
import {
  EVENT_COLORS,
  EVENT_LABELS,
  type TCustomEvent,
  type TJobEvent,
} from "./calendar.types";

interface Props {
  event: TJobEvent | TCustomEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: TCustomEvent) => void;
}

export const EventDetails = ({ event, open, onOpenChange, onEdit }: Props) => {
  const navigate = useNavigate();
  const { mutateAsync: deleteBackendEvent } = useDeleteCalendarEvent();

  const handleDelete = async () =>
    await deleteBackendEvent(event.id, {
      onSuccess: () => onOpenChange(false),
    });

  const isCustom = !("jobId" in event);

  const colors = EVENT_COLORS[event.source];

  const handleEdit = () => {
    if (isCustom) {
      onOpenChange(false);
      onEdit(event);
    }
  };

  const start = "startDate" in event ? event.startDate : event.date;
  const end = "endDate" in event ? event.endDate : undefined;
  const hasTimeRange = end !== undefined && start.getTime() !== end.getTime();
  const isMultiDay = end && !isSameDay(start, end);

  const view = isCustom
    ? {
        job: null,
        title: event.title,
        subtitle: null,
        description: event.description,
        heading:
          hasTimeRange && !isMultiDay
            ? `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`
            : "",
      }
    : {
        job: event.jobId,
        title: event.title,
        subtitle: event.companyName,
        description: "",
        heading: `${EVENT_LABELS[event.source] ?? ""} at ${event.companyName}`,
      };

  const navigateToJobPage = () => {
    if (view.job) {
      onOpenChange(false);
      navigate(generatePath(JOB_DETAIL_PAGE, { jobId: view.job }));
    }
  };

  return (
    <DrawLog onOpenChange={onOpenChange} open={open}>
      <DrawLogContent className="gap-0" showCloseButton={false}>
        <DrawLogHeader className="mb-0">
          <div className="flex justify-between gap-2">
            <DrawLogTitle className="flex items-center gap-2">
              <p className="truncate">{view.title}</p>
              {view.job ? (
                <Button
                  onClick={navigateToJobPage}
                  size="icon-sm"
                  variant="outline"
                >
                  <ArrowSquareOutIcon />
                </Button>
              ) : null}
            </DrawLogTitle>
            <div className="flex items-center gap-1">
              {view.job ? null : (
                <>
                  <Button onClick={handleEdit} size="icon-sm" variant="outline">
                    <PencilIcon />
                  </Button>
                  <MutationButton
                    mutationFn={handleDelete}
                    requireConfirmation
                    size="icon-sm"
                    successMessage="Event deleted"
                    variant="destructive"
                  >
                    <TrashIcon />
                  </MutationButton>
                </>
              )}
              <DrawLogClose
                render={<Button size="icon-sm" variant="outline" />}
              >
                <XIcon />
              </DrawLogClose>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <ClockIcon />
            {isMultiDay ? (
              <span>
                {format(start, "d MMM")} – {format(end, "d MMM yyyy")}
              </span>
            ) : (
              <span>
                {format(start, "d MMMM yyyy")}
                {view.heading ? ` · ${view.heading}` : ""}
              </span>
            )}
            {view.job ? (
              <span className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
            ) : null}
          </div>
        </DrawLogHeader>

        <DrawLogBody>
          <DrawLogDescription className="pt-0">
            {view.description}
          </DrawLogDescription>
        </DrawLogBody>
        {/* TODO: Restore "Synced to Google Calendar" field once Google OAuth calendar.events scope is approved */}
        {/* TODO: Restore cloud sync icon once Google OAuth calendar.events scope is approved */}
      </DrawLogContent>
    </DrawLog>
  );
};
