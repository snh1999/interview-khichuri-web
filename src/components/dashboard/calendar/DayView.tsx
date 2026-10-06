import { useCalendarStore } from "@/store/calendarStore.ts";
import { toAnchorDate } from "./calendar.helpers.ts";
import type { TCustomEvent, TJobEvent } from "./calendar.types.ts";
import { TimeGrid } from "./timegrid/TimeGrid.tsx";

interface Props {
  events: (TJobEvent | TCustomEvent)[];
  onSlotSelect: (start: Date, end: Date, allDay?: boolean) => void;
  onCustomEventClick: (events: (TJobEvent | TCustomEvent)[], day: Date) => void;
}

export const DayView = ({
  events,
  onSlotSelect,
  onCustomEventClick,
}: Props) => {
  const anchor = useCalendarStore((s) => s.anchor);

  return (
    <TimeGrid
      days={[toAnchorDate(anchor.year, anchor.month, anchor.day)]}
      events={events}
      onCustomEventClick={onCustomEventClick}
      onSlotSelect={onSlotSelect}
    />
  );
};
