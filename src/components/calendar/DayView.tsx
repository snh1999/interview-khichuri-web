import { useScheduleStore } from "@/store/scheduleStore.ts";
import { toAnchorDate } from "./calendar.helpers";
import type { TCustomEvent, TJobEvent } from "./calendar.types";
import { TimeGrid } from "./timegrid/TimeGrid";

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
  const anchor = useScheduleStore((s) => s.anchor);

  return (
    <TimeGrid
      days={[toAnchorDate(anchor.year, anchor.month, anchor.day)]}
      events={events}
      onCustomEventClick={onCustomEventClick}
      onSlotSelect={onSlotSelect}
    />
  );
};
