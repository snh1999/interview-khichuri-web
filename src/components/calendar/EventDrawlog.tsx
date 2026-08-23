import {
  ArrowSquareOutIcon,
  CalendarBlankIcon,
  PencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { generatePath, useNavigate } from "react-router";
import { useDeleteCalendarEvent } from "@/api/calendar";
import { JOB_DETAIL_PAGE } from "@/app.constants.ts";
import { Button } from "@/components/ui/button";
import { MutationButton } from "@/components/ui/button/MutationButton.tsx";
import {
  DrawLog,
  DrawLogBody,
  DrawLogContent,
  DrawLogDescription,
  DrawLogHeader,
  DrawLogTitle,
} from "@/components/ui/custom/DrawLog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { useScheduleStore } from "@/store/scheduleStore.ts";
import type { TCustomEvent, TJobEvent } from "./calendar.types";
import { EVENT_COLORS, EVENT_LABELS } from "./calendar.types";

export const EventDrawlog = () => {
  const eventList = useScheduleStore((s) => s.eventList);
  const closeEventList = useScheduleStore((s) => s.closeEventList);

  const open = !!eventList;
  const date = eventList?.date;
  const events = eventList?.events ?? [];

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      closeEventList();
    }
  };

  return (
    <DrawLog onOpenChange={handleOpenChange} open={open}>
      <DrawLogContent className="gap-0">
        <DrawLogHeader>
          <DrawLogTitle className="flex items-center gap-2">
            <CalendarBlankIcon className="shrink-0" />
            <span className="truncate">
              {date ? format(date, "d MMMM yyyy") : "Events"}
            </span>
          </DrawLogTitle>
          <DrawLogDescription>
            {events.length} event{events.length === 1 ? "" : "s"}
          </DrawLogDescription>
        </DrawLogHeader>

        <DrawLogBody className="space-y-1 px-3">
          {events.map((event) => (
            <EventListItem event={event} key={event.id} />
          ))}
          {events.length === 0 && (
            <p className="p-2 text-center text-muted-foreground text-sm">
              No events
            </p>
          )}
        </DrawLogBody>
      </DrawLogContent>
    </DrawLog>
  );
};

interface IProps {
  event: TJobEvent | TCustomEvent;
}

const EventListItem = ({ event }: IProps) => {
  const navigate = useNavigate();
  const openEditDrawer = useScheduleStore((s) => s.openEditDrawer);
  const closeEventList = useScheduleStore((s) => s.closeEventList);
  const { mutateAsync: deleteBackendEvent } = useDeleteCalendarEvent();

  const colors = EVENT_COLORS[event.source];
  const isCustom = !("jobId" in event);

  const view = isCustom
    ? { title: event.title, subtitle: event.description }
    : {
        title: event.title,
        subtitle: `${EVENT_LABELS[event.source] ?? ""} at ${event.companyName}`,
      };

  const handleEdit = () => openEditDrawer(event as TCustomEvent);
  const handleDelete = () =>
    deleteBackendEvent(event.id, { onSuccess: closeEventList });

  const navigateToJob = () =>
    navigate(
      generatePath(JOB_DETAIL_PAGE, { jobId: (event as TJobEvent).jobId })
    );

  return (
    <Item className={`${colors.bg}`}>
      <ItemContent className="min-w-0">
        <ItemTitle className="w-full truncate">{view.title}</ItemTitle>
        {view.subtitle !== undefined && (
          <p className="truncate text-muted-foreground text-xs">
            {view.subtitle}
          </p>
        )}
      </ItemContent>
      <ItemActions className="gap-1">
        {isCustom ? (
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
        ) : (
          <Button onClick={navigateToJob} size="icon-sm" variant="outline">
            <ArrowSquareOutIcon />
          </Button>
        )}
        {/* TODO: Restore cloud sync icon once Google OAuth calendar.events scope is approved */}
      </ItemActions>
    </Item>
  );
};
